# Secret Recovery with Lagrange Interpolation

This project demonstrates recovering a secret integer using Lagrange interpolation at x=0, given k points (x, y) where y values are encoded in various bases. The script works with arbitrarily large integers using JavaScript's BigInt.

## Usage

```
node solve.js [input.json]
```
If no input file is specified, `input.json` is used by default.

## Test Case 1

**input.json:**
```json
{
"keys": {
    "n": 10,
    "k": 7
  },
  "1": {
    "base": "6",
    "value": "13444211440455345511"
  },
  "2": {
    "base": "15",
    "value": "aed7015a346d63"
  },
  "3": {
    "base": "15",
    "value": "6aeeb69631c227c"
  },
  "4": {
    "base": "16",
    "value": "e1b5e05623d881f"
  },
  "5": {
    "base": "8",
    "value": "316034514573652620673"
  },
  "6": {
    "base": "3",
    "value": "2122212201122002221120200210011020220200"
  },
  "7": {
    "base": "3",
    "value": "20120221122211000100210021102001201112121"
  },
  "8": {
    "base": "6",
    "value": "20220554335330240002224253"
  },
  "9": {
    "base": "12",
    "value": "45153788322a1255483"
  },
  "10": {
    "base": "7",
    "value": "1101613130313526312514143"
  }
}
```

**Command:**
```
node solve.js input.json
```

**Output:**
```
79836264049851
```

---

## Test Case 2

**input.json:**
```json
{
    "keys": {
        "n": 4,
        "k": 3
    },
    "1": {
        "base": "10",
        "value": "4"
    },
    "2": {
        "base": "2",
        "value": "111"
    },
    "3": {
        "base": "10",
        "value": "12"
    },
    "6": {
        "base": "4",
        "value": "213"
    }
}
```

**Command:**
```
node solve.js input.json
```

**Output:**
```
3
```

---

## Notes
- The script expects at least `k` valid points in the input.
- All calculations are performed using BigInt for arbitrary precision.
- The output is the recovered secret integer at x=0.
