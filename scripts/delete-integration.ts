import { client } from '../lib/db';

async function deleteIntegration() {
    try {
        const result = await client.integration.deleteMany({
            where: {
                name: 'INSTAGRAM'
            }
        });

        console.log(`✅ Deleted ${result.count} Instagram integration(s)`);
        console.log('Now reconnect your Instagram account through the app!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.$disconnect();
    }
}

deleteIntegration();
