import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users, userItems, userHistoryLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Shop Inventory Catalog (Hardcoded list of available merchandise)
export const SHOP_ITEMS = [
  // POTIONS (Consumable)
  {
    id: "health_potion",
    name: "Health Potion",
    type: "potion",
    price: 10,
    statBoost: 15,
    description: "Tastes like strawberries and hope. Restores +15 HP immediately.",
  },
  {
    id: "elixir_of_life",
    name: "Elixir of Life",
    type: "potion",
    price: 25,
    statBoost: 40,
    description: "An ancient glowing formula. Restores +40 HP immediately.",
  },
  // WEAPONS (Equippable, +Boss Damage)
  {
    id: "training_sword",
    name: "Training Wooden Sword",
    type: "weapon",
    price: 15,
    statBoost: 2,
    description: "Slightly better than a tree branch. Deals +2 damage to Bosses.",
  },
  {
    id: "steel_blade",
    name: "Adventurer's Steel Blade",
    type: "weapon",
    price: 40,
    statBoost: 6,
    description: "Forged with reliable steel. Deals +6 damage to Bosses.",
  },
  {
    id: "wizard_staff",
    name: "Staff of Focus",
    type: "weapon",
    price: 75,
    statBoost: 12,
    description: "Channels your focus. Deals +12 damage to Bosses.",
  },
  {
    id: "excalibur",
    name: "Excalibur Replica",
    type: "weapon",
    price: 150,
    statBoost: 28,
    description: "Unbelievably sharp! Deals +28 damage to Bosses.",
  },
  // SHIELDS & ARMOR (Equippable, -Damage Taken)
  {
    id: "wooden_shield",
    name: "Buckler Shield",
    type: "shield",
    price: 15,
    statBoost: 1,
    description: "Strap-on wooden buckler. Reduces habit damage taken by 1.",
  },
  {
    id: "leather_armor",
    name: "Ranger Leather Armor",
    type: "armor",
    price: 45,
    statBoost: 3,
    description: "Flexible, lightweight leather chestpiece. Reduces habit damage by 3.",
  },
  {
    id: "plate_armor",
    name: "Paladin Plate Mail",
    type: "armor",
    price: 95,
    statBoost: 7,
    description: "Heavy steel protection. Reduces habit damage taken by 7.",
  },
  {
    id: "aegis_shield",
    name: "Aegis Barrier",
    type: "shield",
    price: 160,
    statBoost: 12,
    description: "Mystical shield that deflects bad vibes. Reduces habit damage taken by 12.",
  },
];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user purchased inventory
    const inventory = await db
      .select()
      .from(userItems)
      .where(eq(userItems.userId, user.id));

    return NextResponse.json({
      shopCatalog: SHOP_ITEMS,
      inventory,
    });
  } catch (error) {
    console.error("Shop GET error:", error);
    return NextResponse.json({ error: "Failed to fetch shop inventory" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, itemId } = body; // action: 'buy' | 'equip' | 'unequip'

    if (!action || !itemId) {
      return NextResponse.json({ error: "Action and Item ID are required" }, { status: 400 });
    }

    // Find the item in our catalog
    const catalogItem = SHOP_ITEMS.find((item) => item.id === itemId);
    if (!catalogItem && action === "buy") {
      return NextResponse.json({ error: "Item not found in catalog" }, { status: 404 });
    }

    if (action === "buy") {
      const item = catalogItem!;
      // Check gold
      if (user.gold < item.price) {
        return NextResponse.json({ error: `Not enough Gold! You need ${item.price} Gold, but only have ${user.gold}.` }, { status: 400 });
      }

      // Check if user already owns non-potion item
      if (item.type !== "potion") {
        const ownedResult = await db
          .select()
          .from(userItems)
          .where(and(eq(userItems.userId, user.id), eq(userItems.itemId, item.id)))
          .limit(1);

        if (ownedResult.length > 0) {
          return NextResponse.json({ error: "You already own this piece of equipment!" }, { status: 400 });
        }
      }

      // Process purchase
      let updatedHp = user.hp;
      let feedback = "";

      if (item.type === "potion") {
        // Immediate consumption
        // Class adjustment: Cleric receives 50% more healing from potions
        let finalHeal = item.statBoost;
        if (user.class === "Cleric") {
          finalHeal = Math.floor(finalHeal * 1.5);
        }

        updatedHp = Math.min(user.maxHp, user.hp + finalHeal);
        const goldSpent = item.price;

        const [updatedUser] = await db
          .update(users)
          .set({
            gold: user.gold - goldSpent,
            hp: updatedHp,
          })
          .where(eq(users.id, user.id))
          .returning();

        // Create log
        await db.insert(userHistoryLogs).values({
          userId: user.id,
          actionType: "purchase",
          description: `Consumed ${item.name} for ${goldSpent} Gold. Restored +${finalHeal} HP.`,
          goldChange: -goldSpent,
          hpChange: finalHeal,
        });

        const { passwordHash: _, salt: __, ...userProfile } = updatedUser;
        return NextResponse.json({
          success: true,
          feedback: `Consumed ${item.name}! Healed +${finalHeal} HP. Current health: ${updatedHp}/${user.maxHp}.`,
          user: userProfile,
        });
      } else {
        // Buy Equipment
        const goldSpent = item.price;

        const [newItem] = await db
          .insert(userItems)
          .values({
            userId: user.id,
            itemId: item.id,
            name: item.name,
            type: item.type,
            statBoost: item.statBoost,
            equipped: false,
          })
          .returning();

        const [updatedUser] = await db
          .update(users)
          .set({
            gold: user.gold - goldSpent,
          })
          .where(eq(users.id, user.id))
          .returning();

        await db.insert(userHistoryLogs).values({
          userId: user.id,
          actionType: "purchase",
          description: `Bought equipment: ${item.name} for ${goldSpent} Gold.`,
          goldChange: -goldSpent,
        });

        const { passwordHash: _, salt: __, ...userProfile } = updatedUser;
        return NextResponse.json({
          success: true,
          feedback: `Bought ${item.name}! Head over to your Equipment section to equip it.`,
          user: userProfile,
          item: newItem,
        });
      }
    } else if (action === "equip") {
      // Find item in user's inventory
      const ownedResult = await db
        .select()
        .from(userItems)
        .where(and(eq(userItems.userId, user.id), eq(userItems.itemId, itemId)))
        .limit(1);

      if (ownedResult.length === 0) {
        return NextResponse.json({ error: "You don't own this item!" }, { status: 400 });
      }

      const itemToEquip = ownedResult[0];

      // Unequip all items of the same type first
      await db
        .update(userItems)
        .set({ equipped: false })
        .where(and(eq(userItems.userId, user.id), eq(userItems.type, itemToEquip.type)));

      // Equip this item
      const [updatedItem] = await db
        .update(userItems)
        .set({ equipped: true })
        .where(eq(userItems.id, itemToEquip.id))
        .returning();

      await db.insert(userHistoryLogs).values({
        userId: user.id,
        actionType: "equip",
        description: `Equipped ${itemToEquip.name} (+${itemToEquip.statBoost} ${
          itemToEquip.type === "weapon" ? "damage" : "defense"
        }).`,
      });

      return NextResponse.json({
        success: true,
        feedback: `Equipped ${itemToEquip.name}!`,
        item: updatedItem,
      });
    } else if (action === "unequip") {
      // Find item in user's inventory
      const ownedResult = await db
        .select()
        .from(userItems)
        .where(and(eq(userItems.userId, user.id), eq(userItems.itemId, itemId)))
        .limit(1);

      if (ownedResult.length === 0) {
        return NextResponse.json({ error: "You don't own this item!" }, { status: 400 });
      }

      const itemToUnequip = ownedResult[0];

      const [updatedItem] = await db
        .update(userItems)
        .set({ equipped: false })
        .where(eq(userItems.id, itemToUnequip.id))
        .returning();

      await db.insert(userHistoryLogs).values({
        userId: user.id,
        actionType: "unequip",
        description: `Unequipped ${itemToUnequip.name}.`,
      });

      return NextResponse.json({
        success: true,
        feedback: `Unequipped ${itemToUnequip.name}.`,
        item: updatedItem,
      });
    }

    return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
  } catch (error: any) {
    console.error("Shop POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to execute shop action" }, { status: 500 });
  }
}
