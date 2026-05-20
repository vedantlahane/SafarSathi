import { advisoryRepo } from '../backend/src/modules/advisory/advisory.repo.js';

async function main() {
    try {
        const items = await advisoryRepo.listAll();
        console.log("Found items:", items.length);
        if (items.length > 0) {
            console.log("First item createdAt type:", typeof items[0].createdAt);
            console.log("First item createdAt value:", items[0].createdAt);
            
            // let's see if toISOString exists
            console.log("Has toISOString?", typeof items[0].createdAt?.toISOString === 'function');
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

main();
