/**
 * Frontend multiplication logic for local-only mode.
 * Mirrors backend behavior so UI flow remains unchanged.
 */

function decomposeNumber(num) {
  if (num < 0 || !Number.isInteger(num)) {
    throw new Error('Number must be a non-negative integer');
  }

  const blocks = {
    hundreds: 0,
    fifties: 0,
    tens: 0,
    fives: 0,
    ones: 0
  };

  let remaining = num;

  blocks.hundreds = Math.floor(remaining / 100);
  remaining %= 100;

  blocks.fifties = Math.floor(remaining / 50);
  remaining %= 50;

  blocks.tens = Math.floor(remaining / 10);
  remaining %= 10;

  blocks.fives = Math.floor(remaining / 5);
  remaining %= 5;

  blocks.ones = remaining;

  return blocks;
}

function visualizeFirstStep(A) {
  if (A === 1) {
    return [{ type: 'one', value: 1, count: 1, total: 1 }];
  }
  if (A === 5) {
    return [{ type: 'five', value: 5, count: 1, total: 5 }];
  }
  if (A === 10) {
    return [{ type: 'ten', value: 10, count: 1, total: 10 }];
  }
  if (A === 50) {
    return [{ type: 'fifty', value: 50, count: 1, total: 50 }];
  }
  if (A === 100) {
    return [{ type: 'hundred', value: 100, count: 1, total: 100 }];
  }

  const blocks = decomposeNumber(A);
  const blocksList = [];

  if (blocks.hundreds > 0) {
    blocksList.push({
      type: 'hundred',
      value: 100,
      count: blocks.hundreds,
      total: blocks.hundreds * 100
    });
  }
  if (blocks.fifties > 0) {
    blocksList.push({
      type: 'fifty',
      value: 50,
      count: blocks.fifties,
      total: blocks.fifties * 50
    });
  }
  if (blocks.tens > 0) {
    blocksList.push({
      type: 'ten',
      value: 10,
      count: blocks.tens,
      total: blocks.tens * 10
    });
  }
  if (blocks.fives > 0) {
    blocksList.push({
      type: 'five',
      value: 5,
      count: blocks.fives,
      total: blocks.fives * 5
    });
  }
  if (blocks.ones > 0) {
    blocksList.push({
      type: 'one',
      value: 1,
      count: blocks.ones,
      total: blocks.ones
    });
  }

  return blocksList;
}

function createReplicationTable(decomposedA, B) {
  const table = [];

  for (let i = 0; i < B; i += 1) {
    table.push({
      row: i + 1,
      blocks: JSON.parse(JSON.stringify(decomposedA))
    });
  }

  return table;
}

function combineBlocks(table) {
  const combined = {
    hundreds: 0,
    fifties: 0,
    tens: 0,
    fives: 0,
    ones: 0
  };

  table.forEach((row) => {
    row.blocks.forEach((block) => {
      const type = `${block.type}s`;
      combined[type] += block.count;
    });
  });

  combined.fives += Math.floor(combined.ones / 5);
  combined.ones %= 5;

  combined.tens += Math.floor(combined.fives / 2);
  combined.fives %= 2;

  combined.fifties += Math.floor(combined.tens / 5);
  combined.tens %= 5;

  combined.hundreds += Math.floor(combined.fifties / 2);
  combined.fifties %= 2;

  return combined;
}

function calculateTotal(combined) {
  return (
    combined.hundreds * 100 +
    combined.fifties * 50 +
    combined.tens * 10 +
    combined.fives * 5 +
    combined.ones
  );
}

export function multiplyWithVisualization(num1, num2) {
  if (!Number.isInteger(num1) || !Number.isInteger(num2)) {
    throw new Error('Invalid input. Both numbers must be integers.');
  }

  if (num1 < 0 || num2 < 0) {
    throw new Error('Invalid input. Numbers must be non-negative.');
  }

  if (num1 > 1000 || num2 > 1000) {
    throw new Error('Numbers must be less than or equal to 1000');
  }

  const A = Math.max(num1, num2);
  const B = Math.min(num1, num2);

  if (A === 0 || B === 0) {
    return {
      num1,
      num2,
      A,
      B,
      step1: [],
      step2: [],
      step3: { hundreds: 0, fifties: 0, tens: 0, fives: 0, ones: 0 },
      result: 0
    };
  }

  const step1 = visualizeFirstStep(A);
  const step2 = createReplicationTable(step1, B);
  const step3 = combineBlocks(step2);
  const result = calculateTotal(step3);

  return {
    num1,
    num2,
    A,
    B,
    step1,
    step2,
    step3,
    result
  };
}
