import { NextResponse } from 'next/server'
import { client } from '@/lib/db'
import { sendInstagramMessage, sendInstagramCommentReply } from '@/lib/instagram'
import { generateAIResponse } from '@/lib/gemini'
import fs from 'fs'
import path from 'path'

const LOG_FILE = path.join(process.cwd(), 'public', 'debug_webhook.txt');

function log(message: string) {
  try {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
  } catch (e) {
    console.error('Failed to write log', e); // Fallback
  }
}

// 1. Verify Webhook (GET)
// Instagram sends a GET request to verify the webhook URL ownership.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // Check if mode and token are correct
  if (mode === 'subscribe' && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// 2. Handle Events (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const headers = Object.fromEntries(req.headers);
    log(`WEBHOOK POST: ${JSON.stringify(body, null, 2)}`);
    log(`HEADERS: ${JSON.stringify(headers, null, 2)}`);
    console.log('Webhook Received:', JSON.stringify(body, null, 2))

    // Validations (Signature check skipping for MVP speed but IMPORTANT for prod)

    if (body.object === 'instagram') {
      // IMPORTANT: Return 200 immediately to prevent Facebook retries
      // Process the webhook asynchronously
      processWebhookAsync(body).catch(error => {
        console.error('Async webhook processing error:', error)
        log(`ASYNC ERROR: ${JSON.stringify(error.message)}`)
      })

      return NextResponse.json({ received: true }, { status: 200 })
    }

    return NextResponse.json({ error: 'Event not handled' }, { status: 404 })

  } catch (error) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Process webhook events asynchronously
async function processWebhookAsync(body: any) {
  // Loop over entries
  for (const entry of body.entry) {
    // Entry ID is usually the Instagram Account ID
    const instagramAccountId = entry.id

    // Find the user/integration for this account
    // Ideally we cache this or look it up efficiently

    // entry.messaging is for DMs, entry.changes is for Comments/others
    if (entry.messaging) {
      for (const messageEvent of entry.messaging) {
        // Handle DM
        await handleDm(instagramAccountId, messageEvent)
      }
    }

    if (entry.changes) {
      for (const changeEvent of entry.changes) {
        // Handle Comment
        if (changeEvent.field === 'comments') {
          await handleComment(instagramAccountId, changeEvent.value)
        }
      }
    }
  }
}

async function handleDm(instagramAccountId: string, event: any) {
  try {
    const senderId = event.sender.id
    const messageText = event.message?.text
    const isEcho = event.message?.is_echo

    if (isEcho || !messageText || senderId === instagramAccountId) {
      console.log(`Ignoring potential loop. Echo: ${isEcho}, Sender: ${senderId}`);
      return
    }

    console.log(`Received DM from ${senderId}: ${messageText}`)

    // 1. Find User/Integration
    const integration = await client.integration.findFirst({
      where: { instagramId: instagramAccountId },
      include: { user: true }
    })

    if (!integration) {
      console.log('No integration found for', instagramAccountId)
      return
    }

    // 2. Persist Conversation & User Message
    const conversation = await client.conversation.upsert({
      where: {
        userId_recipientId: {
          userId: integration.userId,
          recipientId: senderId
        }
      },
      update: {},
      create: {
        userId: integration.userId,
        recipientId: senderId
      }
    })

    await client.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: messageText
      }
    })

    // 3. Find Automations
    const automations = await client.automation.findMany({
      where: {
        userId: integration.userId,
        active: true,
        trigger: { some: { type: 'DM' } }
      },
      include: { keywords: true, listener: { include: { agent: true } } } // Include Agent for prompt
    })

    // 4. Match Logic
    for (const automation of automations) {
      let match = false;
      if (automation.keywords.length > 0) {
        match = automation.keywords.some((k: { word: string }) => messageText.toLowerCase().includes(k.word.toLowerCase()));
      } else {
        match = true;
      }

      if (match && automation.listener) {
        console.log(`Executing Automation: ${automation.name}`)

        if (automation.listener.listener === 'MESSAGE') {
          const replyText = automation.listener.dmReply || "Thanks for your message!";
          await sendInstagramMessage(integration.token, senderId, replyText, integration.pageId || undefined);

          await client.message.create({
            data: {
              conversationId: conversation.id,
              role: 'ASSISTANT',
              content: replyText
            }
          })
          return;
        } else if (automation.listener.listener === 'SMART_AI') {
          // Smart AI Logic
          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) {
            console.error('GEMINI_API_KEY missing');
            return;
          }

          // Fetch History (Last 10 messages)
          const historyMessages = await client.message.findMany({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: 'desc' },
            take: 10
          })

          // Reverse to chronological order and map
          const history = historyMessages.reverse().map((m: { role: string, content: string }) => ({
            role: m.role === 'USER' ? 'user' : 'model',
            parts: m.content
          })) as { role: 'user' | 'model', parts: string }[];

          // Remove last message (current user message) from history passed to chat init?
          // Gemini `startChat({ history })` expects previous history. 
          // If we include current message in history, we shouldn't send it again in `sendMessage`.
          // My `generateAIResponse` takes `history` + `userMessage`.
          // So we should exclude the *current* message from history passed to `generateAIResponse`.
          // `historyMessages` includes the just-created USER message at the end (desc -> reverse -> last).
          // Let's filter it out or just rely on `generateAIResponse` handling.
          // Actually `generateAIResponse` takes `userMessage` separately. 
          // So pass `history` excluding the last one.

          const historyForAI = history.slice(0, -1); // Exclude the current message

          const prompt = automation.listener.agent?.prompt || "You are a helpful assistant.";

          const aiResponse = await generateAIResponse(apiKey, prompt, messageText, historyForAI);

          await sendInstagramMessage(integration.token, senderId, aiResponse, integration.pageId || undefined);

          await client.message.create({
            data: {
              conversationId: conversation.id,
              role: 'ASSISTANT',
              content: aiResponse
            }
          })
          console.log('Sent AI Reply');
          return;
        }
      }
    }
  } catch (error) {
    console.error('Error handling DM:', error)
    log(`DM ERROR: ${JSON.stringify(error)}`)
  }
}

async function handleComment(instagramAccountId: string, value: any) {
  try {
    const commenterId = value.from.id
    const commentText = value.text
    const mediaId = value.media.id

    if (commenterId === instagramAccountId) {
      console.log(`Ignoring self-comment from ${commenterId}`);
      return
    }

    console.log(`Received Comment on ${mediaId} from ${commenterId}: ${commentText}`)

    // 1. Find Integration
    const integration = await client.integration.findFirst({
      where: { instagramId: instagramAccountId },
      include: { user: { include: { subscription: true } } }
    })

    if (!integration) return

    // 2. Find Automations (Trigger: COMMENT)
    const automations = await client.automation.findMany({
      where: {
        userId: integration.userId,
        active: true,
        trigger: {
          some: { type: 'COMMENT' }
        }
      },
      include: {
        keywords: true,
        listener: true,
        posts: true
      }
    })

    log(`Found ${automations.length} potential automations for user ${integration.userId}. MediaId: ${mediaId}`);
    automations.forEach(a => {
      log(`Auto: ${a.name} (ID: ${a.id}) - Keywords: ${a.keywords.map(k => k.word).join(',')} - Posts: ${a.posts.length} - Listener: ${a.listener?.listener || 'None'}`);
      if (a.posts.length > 0) {
        log(`  Attached Posts: ${a.posts.map(p => p.postid).join(', ')}`);
      }
    });

    // 3. Match Logic
    for (const automation of automations) {
      let match = false;

      // Check Post Specificity
      if (automation.posts.length > 0) {
        const postMatch = automation.posts.some((p: { postid: string }) => p.postid === mediaId)
        if (!postMatch) {
          log(`Skipping Automation ${automation.name}: Post ID mismatch. Expected one of [${automation.posts.map(p => p.postid)}] but got ${mediaId}`)
          continue
        }
      }

      if (automation.keywords.length > 0) {
        match = automation.keywords.some((k: { word: string }) => commentText.toLowerCase().includes(k.word.toLowerCase()));
        log(`Keyword match result for ${automation.name}: ${match}. Text: "${commentText}"`);
      } else {
        match = true; // Catch All
        log(`Catch-all match for ${automation.name}`);
      }

      if (match && automation.listener) {
        log(`Executing Comment Automation: ${automation.name}`)

        if (automation.listener.listener === 'MESSAGE') {
          const replyText = automation.listener.commentReply || "Thanks!";
          try {
            await sendInstagramCommentReply(integration.token, value.id, replyText);
            log(`Sent Comment Reply to ${value.id}: ${replyText}`);
          } catch (e: any) {
            log(`ERROR sending reply: ${JSON.stringify(e?.response?.data || e.message)}`);
          }
          return;
        }
      } else {
        log(`Automation ${automation.name} did not execute. Match: ${match}, Listener: ${!!automation.listener}`);
      }
    }
  } catch (error) {
    console.error('Error handling comment:', error)
    log(`COMMENT ERROR: ${JSON.stringify(error)}`)
  }
}