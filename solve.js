// solve.js
// Usage: node solve.js [input.json]
// Reads JSON, decodes base-encoded y values, uses Lagrange interpolation at x=0
// to compute the secret constant c. Works with arbitrarily large integers via BigInt.

const fs = require('fs');
const path = require('path');

// ---------- BigInt utilities ----------
function bigGcd(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

function bigPow(base, exp) {
  // not used currently; present if needed
  let b = BigInt(base);
  let e = BigInt(exp);
  let res = 1n;
  while (e > 0n) {
    if (e & 1n) res = res * b;
    b = b * b;
    e >>= 1n;
  }
  return res;
}

// ---------- Fraction with BigInt ----------
class Fraction {
  constructor(num = 0n, den = 1n) {
    if (den === 0n) throw new Error("Denominator zero");
    if (den < 0n) { num = -num; den = -den; }
    const g = bigGcd(num, den);
    this.num = num / g;
    this.den = den / g;
  }

  static fromBigInt(n) { return new Fraction(BigInt(n), 1n); }

  add(other) {
    const n = this.num * other.den + other.num * this.den;
    const d = this.den * other.den;
    return new Fraction(n, d);
  }

  sub(other) {
    const n = this.num * other.den - other.num * this.den;
    const d = this.den * other.den;
    return new Fraction(n, d);
  }

  mul(other) {
    const n = this.num * other.num;
    const d = this.den * other.den;
    return new Fraction(n, d);
  }

  div(other) {
    if (other.num === 0n) throw new Error("Division by zero fraction");
    const n = this.num * other.den;
    const d = this.den * other.num;
    return new Fraction(n, d);
  }

  toString() {
    if (this.den === 1n) return this.num.toString();
    return this.num.toString() + "/" + this.den.toString();
  }

  // Returns integer if exact else throws
  toIntegerStringIfExact() {
    if (this.den === 1n) return this.num.toString();
    // if divisible:
    if (this.num % this.den === 0n) return (this.num / this.den).toString();
    throw new Error("Result is not integer: " + this.toString());
  }
}

// ---------- decode base-coded value string to BigInt ----------
function decodeValueToBigInt(valueStr, baseStr) {
  const base = Number(baseStr);
  if (!(Number.isInteger(base) && base >= 2 && base <= 36)) {
    throw new Error("Unsupported base: " + baseStr);
  }
  let s = valueStr.trim();
  // allow uppercase/lowercase digits
  s = s.toLowerCase();
  let acc = 0n;
  const b = BigInt(base);
  for (let ch of s) {
    let digit;
    if (ch >= '0' && ch <= '9') digit = ch.charCodeAt(0) - 48;
    else if (ch >= 'a' && ch <= 'z') digit = ch.charCodeAt(0) - 87;
    else throw new Error("Invalid digit in value: " + ch);
    if (digit >= base) throw new Error(`Digit ${ch} not valid for base ${base}`);
    acc = acc * b + BigInt(digit);
  }
  return acc;
}

// ---------- Lagrange interpolation at x=0 using k points ----------
function lagrangeAtZero(points) {
  // points: array of {x: BigInt, y: BigInt}
  const k = points.length;
  let result = new Fraction(0n, 1n);

  for (let i = 0; i < k; i++) {
    let numerator = new Fraction(points[i].y, 1n); // start with y_i
    // multiply by product (-x_j)/(x_i - x_j) for j != i
    for (let j = 0; j < k; j++) {
      if (j === i) continue;
      const negXj = -points[j].x;             // -x_j
      const denom = (points[i].x - points[j].x); // x_i - x_j
      if (denom === 0n) throw new Error("Duplicate x values encountered");
      numerator = numerator.mul(new Fraction(negXj, denom));
    }
    result = result.add(numerator);
  }

  return result;
}

// ---------- Main ----------
function main() {
  const filename = process.argv[2] || 'input.json';
  if (!fs.existsSync(filename)) {
    console.error("File not found:", filename);
    process.exit(1);
  }

  const raw = fs.readFileSync(filename, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse JSON:", e.message);
    process.exit(1);
  }

  if (!data.keys || typeof data.keys !== 'object') {
    console.error("Invalid JSON: missing keys object");
    process.exit(1);
  }

  const n = Number(data.keys.n);
  const k = Number(data.keys.k);
  if (!Number.isInteger(n) || !Number.isInteger(k) || k <= 0) {
    console.error("Invalid keys.n or keys.k");
    process.exit(1);
  }

  // collect entries excluding "keys"
  const entries = [];
  for (const key of Object.keys(data)) {
    if (key === 'keys') continue;
    // keys in sample are "1","2",... "10" etc
    const obj = data[key];
    if (!obj || typeof obj !== 'object' || !('base' in obj) || !('value' in obj)) {
      continue;
    }
    const x = BigInt(key);
    const y = decodeValueToBigInt(String(obj.value), String(obj.base));
    entries.push({ x, y, rawKey: key });
  }

  if (entries.length < k) {
    console.error(`Not enough points provided: have ${entries.length}, need ${k}`);
    process.exit(1);
  }

  // Sort by x (numeric ascending) to have deterministic selection
  entries.sort((a, b) => (a.x < b.x ? -1 : (a.x > b.x ? 1 : 0)));

  // choose first k points (any k are valid; common approach is choose first k)
  const chosen = entries.slice(0, k).map(e => ({ x: e.x, y: e.y }));

  try {
    const f0 = lagrangeAtZero(chosen);
    // Expect integer
    const secret = f0.toIntegerStringIfExact();
    console.log(secret);
  } catch (e) {
    console.error("Error computing secret:", e.message);
    process.exit(1);
  }
}

main();
