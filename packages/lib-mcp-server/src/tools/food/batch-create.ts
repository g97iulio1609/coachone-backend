import { z } from 'zod';
import type { McpTool, McpContext } from '../../types';
import { FoodAdminService, foodImportSchema } from '@OneCoach/lib-food/food-admin.service';

const batchCreateParameters = z.object({
  items: z.array(foodImportSchema).max(100),
});

export const foodBatchCreateTool: McpTool = {
  name: 'food_batch_create',
  description: `Creates multiple food items in batch. Requires admin privileges.
  
  CRITICAL: After this tool executes successfully, you MUST ALWAYS provide a text response to the user explaining what was created. Include the number of foods created, list the food names, and confirm they have been added to the database. NEVER end the conversation after calling this tool without providing a human-readable summary.`,
  parameters: batchCreateParameters,
  execute: async (args, context: McpContext) => {
    console.warn('🍎🍎🍎 [food_batch_create] Esecuzione tool per creare alimenti in batch');
    console.warn('🍎🍎🍎 [food_batch_create] Numero alimenti da creare:', args.items?.length || 0);
    console.warn('🍎🍎🍎 [food_batch_create] Context:', {
      userId: context.userId,
      isAdmin: context.isAdmin,
    });

    if (!context.isAdmin) {
      console.error('❌ [food_batch_create] Accesso negato: non è admin');
      throw new Error('Unauthorized: Admin access required for this operation');
    }

    if (!args.items || args.items.length === 0) {
      console.error('❌ [food_batch_create] Nessun alimento da creare');
      throw new Error('No items provided to create');
    }

    console.warn('✅ [food_batch_create] Autorizzazione OK, creazione batch...');
    console.warn(
      '📋 [food_batch_create] Primi 3 alimenti:',
      JSON.stringify(args.items.slice(0, 3), null, 2)
    );

    const result = await FoodAdminService.import(args.items, {
      userId: context.userId,
      mergeExisting: false, // Create only
    });

    console.warn('✅ [food_batch_create] Batch creato con successo');
    console.warn(
      '📊 [food_batch_create] Risultato:',
      JSON.stringify(result, null, 2).substring(0, 500)
    );
    console.warn('📊 [food_batch_create] Alimenti creati:', result.created || 0);
    console.warn('📊 [food_batch_create] Alimenti già esistenti:', result.skipped || 0);
    console.warn('📊 [food_batch_create] Errori:', result.errors?.length || 0);

    return result;
  },
};
