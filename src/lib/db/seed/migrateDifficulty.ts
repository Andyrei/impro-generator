import mongoose from "mongoose";
import Word from "../models/word";
import WordSuggestion from "../models/wordSuggestion";
import { connectDB } from "../mongodb";

async function migrate() {
  await connectDB();
  console.log("Connected to DB. Starting migration…\n");

  // Use raw collections to bypass Mongoose schema casting — the stored values
  // are still numbers, so we must query them as numbers, not strings.
  const wordCol = Word.collection;
  const sugCol  = WordSuggestion.collection;

  // ── Words ──────────────────────────────────────────────────────────────────
  const wordTotal = await wordCol.countDocuments();
  console.log(`Words total: ${wordTotal}`);

  const easyW   = await wordCol.updateMany({ difficulty: { $lte: 33 } },         { $set: { difficulty: "easy"   } });
  const mediumW = await wordCol.updateMany({ difficulty: { $gt: 33, $lte: 66 } }, { $set: { difficulty: "medium" } });
  const hardW   = await wordCol.updateMany({ difficulty: { $gt: 66 } },           { $set: { difficulty: "hard"   } });

  console.log(`  → easy:   ${easyW.modifiedCount} words updated`);
  console.log(`  → medium: ${mediumW.modifiedCount} words updated`);
  console.log(`  → hard:   ${hardW.modifiedCount} words updated`);

  // ── WordSuggestions ────────────────────────────────────────────────────────
  const sugTotal = await sugCol.countDocuments();
  console.log(`\nWordSuggestions total: ${sugTotal}`);

  const easyS   = await sugCol.updateMany({ difficulty: { $lte: 33 } },         { $set: { difficulty: "easy"   } });
  const mediumS = await sugCol.updateMany({ difficulty: { $gt: 33, $lte: 66 } }, { $set: { difficulty: "medium" } });
  const hardS   = await sugCol.updateMany({ difficulty: { $gt: 66 } },           { $set: { difficulty: "hard"   } });

  console.log(`  → easy:   ${easyS.modifiedCount} suggestions updated`);
  console.log(`  → medium: ${mediumS.modifiedCount} suggestions updated`);
  console.log(`  → hard:   ${hardS.modifiedCount} suggestions updated`);

  // ── Verification ───────────────────────────────────────────────────────────
  console.log("\n── Post-migration counts ─────────────────────────────────────");
  console.log("Words:");
  console.log(`  easy:   ${await wordCol.countDocuments({ difficulty: "easy" })}`);
  console.log(`  medium: ${await wordCol.countDocuments({ difficulty: "medium" })}`);
  console.log(`  hard:   ${await wordCol.countDocuments({ difficulty: "hard" })}`);
  const remainingNumericW = await wordCol.countDocuments({ difficulty: { $type: "number" } });
  if (remainingNumericW > 0) {
    console.warn(`  ⚠️  ${remainingNumericW} word(s) still have a numeric difficulty!`);
  } else {
    console.log("  ✅ No numeric difficulty values remaining in Words.");
  }

  console.log("WordSuggestions:");
  console.log(`  easy:   ${await sugCol.countDocuments({ difficulty: "easy" })}`);
  console.log(`  medium: ${await sugCol.countDocuments({ difficulty: "medium" })}`);
  console.log(`  hard:   ${await sugCol.countDocuments({ difficulty: "hard" })}`);
  const remainingNumericS = await sugCol.countDocuments({ difficulty: { $type: "number" } });
  if (remainingNumericS > 0) {
    console.warn(`  ⚠️  ${remainingNumericS} suggestion(s) still have a numeric difficulty!`);
  } else {
    console.log("  ✅ No numeric difficulty values remaining in WordSuggestions.");
  }

  await mongoose.disconnect();
  console.log("\nDone. Disconnected from MongoDB.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});