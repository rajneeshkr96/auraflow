import { currentUser } from '@clerk/nextjs/server';
import { Instagram, CheckCircle, ExternalLink } from 'lucide-react';
import ActiveIntegration from '@/components/integrations/active-integration';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { client } from '@/lib/db'

const prisma = client;

export default async function IntegrationsPage() {
  const user = await currentUser();
  if (!user) return redirect('/sign-in');

  // Fetch integration status
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: { integrations: true }
  });

  const instagramIntegration = dbUser?.integrations.find(i => i.name === 'INSTAGRAM');
  const isConnected = !!instagramIntegration;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Integrations</h1>
        <p className="text-slate-500 mt-2">Connect your social media accounts to enable automation.</p>
      </div>

      <div className="grid gap-6">
        {/* Instagram Card */}
        <div className="bg-white border text-card-foreground shadow-sm rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full">
            <div className="p-3 bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-600 rounded-xl text-white shrink-0">
              <Instagram className="w-8 h-8" />
            </div>

            {isConnected ? (
              <div className="w-full">
                <ActiveIntegration
                  id={instagramIntegration.id}
                  name="Instagram"
                  detail={`Connected as ${instagramIntegration.instagramId}`}
                  type="INSTAGRAM"
                />
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Instagram
                </h3>
                <p className="text-sm text-slate-500">
                  Connect to automate DMs and comments.
                </p>
              </div>
            )}
          </div>

          {!isConnected && (
            <Link
              href="/api/integrations/instagram/install"
              prefetch={false}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition w-full sm:w-auto text-center justify-center shrink-0"
            >
              Connect Instagram
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Placeholder for future integrations */}
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-400">
          More integrations coming soon...
        </div>
      </div>
    </div>
  );
}