/*
 * A small, safe formula language for the "See if solar is right for you" form.
 *
 * Editors write formulas in Sanity, so this never uses eval or Function: it
 * tokenizes and parses the text itself and only knows numbers, named values,
 * arithmetic, comparisons and a short list of math functions. Anything else is
 * a syntax error, never code.
 *
 *   bill / rate * 12                       arithmetic: + - * / % ^ and ( )
 *   max(0, grossCost - rebate)             functions: see FUNCTIONS
 *   systemKw >= 10 ? 2.45 : 2.75           comparisons and a ? b : c
 *   owner == 1 && creditScore >= 650       && || and !
 *   payment(netCost, apr, termYears)       monthly loan payment
 */

const FUNCTIONS = {
  abs: Math.abs,
  ceil: Math.ceil,
  floor: Math.floor,
  max: Math.max,
  min: Math.min,
  pow: Math.pow,
  round: (value, decimals = 0) => {
    const factor = 10 ** decimals
    return Math.round(value * factor) / factor
  },
  sqrt: Math.sqrt,
  // Sum of a yearly amount that grows by `rate` (0.025 = 2.5%) for `years` years.
  growth: (amount, rate, years) => {
    if (!rate) {
      return amount * years
    }
    return (amount * ((1 + rate) ** years - 1)) / rate
  },
  // Monthly payment on a loan: principal, APR as a fraction (0.0799), term in years.
  payment: (principal, apr, years) => {
    const months = years * 12
    if (months <= 0) {
      return 0
    }
    const monthlyRate = apr / 12
    if (!monthlyRate) {
      return principal / months
    }
    return (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months)
  },
}

export const FORMULA_FUNCTION_NAMES = Object.keys(FUNCTIONS)

export class FormulaError extends Error {
  constructor(message) {
    super(message)
    this.name = 'FormulaError'
  }
}

const TOKEN_PATTERN =
  /\s*(?:(\d+(?:\.\d+)?|\.\d+)|([A-Za-z_][A-Za-z0-9_]*)|(>=|<=|==|!=|&&|\|\||[-+*/%^(),?:<>!]))/uy

function tokenize(source) {
  const tokens = []
  TOKEN_PATTERN.lastIndex = 0
  let index = 0

  while (index < source.length) {
    if (/^\s*$/u.test(source.slice(index))) {
      break
    }
    TOKEN_PATTERN.lastIndex = index
    const match = TOKEN_PATTERN.exec(source)
    if (!match) {
      throw new FormulaError(`Unexpected character "${source[index]}" at position ${index + 1}`)
    }
    const [, number, name, op] = match
    if (number !== undefined) {
      tokens.push({ type: 'number', value: Number(number) })
    } else if (name !== undefined) {
      tokens.push({ type: 'name', value: name })
    } else {
      tokens.push({ type: 'op', value: op })
    }
    index = TOKEN_PATTERN.lastIndex
  }

  return tokens
}

/* Recursive descent, lowest precedence first: ?: , ||, &&, comparisons, + -, * / %, ^, unary. */
function parse(source) {
  const tokens = tokenize(source)
  let position = 0

  const peek = () => tokens[position]
  const isOp = (value) => peek()?.type === 'op' && peek().value === value
  const expectOp = (value) => {
    if (!isOp(value)) {
      throw new FormulaError(`Expected "${value}"`)
    }
    position += 1
  }

  const binary = (operand, ops) => () => {
    let left = operand()
    while (peek()?.type === 'op' && ops.includes(peek().value)) {
      const op = tokens[position].value
      position += 1
      left = { kind: 'binary', op, left, right: operand() }
    }
    return left
  }

  function primary() {
    const token = peek()
    if (!token) {
      throw new FormulaError('Formula ended too early')
    }
    position += 1

    if (token.type === 'number') {
      return { kind: 'number', value: token.value }
    }
    if (token.type === 'name') {
      if (isOp('(')) {
        position += 1
        const args = []
        if (!isOp(')')) {
          args.push(conditional())
          while (isOp(',')) {
            position += 1
            args.push(conditional())
          }
        }
        expectOp(')')
        if (!FUNCTIONS[token.value]) {
          throw new FormulaError(`Unknown function "${token.value}"`)
        }
        return { kind: 'call', name: token.value, args }
      }
      return { kind: 'name', name: token.value }
    }
    if (token.value === '(') {
      const inner = conditional()
      expectOp(')')
      return inner
    }
    throw new FormulaError(`Unexpected "${token.value}"`)
  }

  function unary() {
    if (isOp('-') || isOp('+') || isOp('!')) {
      const op = tokens[position].value
      position += 1
      return { kind: 'unary', op, operand: unary() }
    }
    return primary()
  }

  // Right-associative: 2 ^ 3 ^ 2 is 2 ^ 9.
  function power() {
    const base = unary()
    if (isOp('^')) {
      position += 1
      return { kind: 'binary', op: '^', left: base, right: power() }
    }
    return base
  }

  const product = binary(power, ['*', '/', '%'])
  const sum = binary(product, ['+', '-'])
  const comparison = binary(sum, ['<', '>', '<=', '>=', '==', '!='])
  const and = binary(comparison, ['&&'])
  const or = binary(and, ['||'])

  function conditional() {
    const test = or()
    if (isOp('?')) {
      position += 1
      const consequent = conditional()
      expectOp(':')
      return { kind: 'conditional', test, consequent, alternate: conditional() }
    }
    return test
  }

  const tree = conditional()
  if (position < tokens.length) {
    throw new FormulaError(`Unexpected "${tokens[position].value}"`)
  }
  return tree
}

const BINARY = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => (b === 0 ? 0 : a / b),
  '%': (a, b) => (b === 0 ? 0 : a % b),
  '^': (a, b) => a ** b,
  '<': (a, b) => Number(a < b),
  '>': (a, b) => Number(a > b),
  '<=': (a, b) => Number(a <= b),
  '>=': (a, b) => Number(a >= b),
  '==': (a, b) => Number(a === b),
  '!=': (a, b) => Number(a !== b),
  '&&': (a, b) => Number(Boolean(a) && Boolean(b)),
  '||': (a, b) => Number(Boolean(a) || Boolean(b)),
}

function evaluateNode(node, scope) {
  switch (node.kind) {
    case 'number': {
      return node.value
    }
    case 'name': {
      if (!Object.hasOwn(scope, node.name)) {
        throw new FormulaError(`Unknown value "${node.name}"`)
      }
      return Number(scope[node.name]) || 0
    }
    case 'unary': {
      const value = evaluateNode(node.operand, scope)
      if (node.op === '!') {
        return Number(!value)
      }
      return node.op === '-' ? -value : value
    }
    case 'binary': {
      return BINARY[node.op](evaluateNode(node.left, scope), evaluateNode(node.right, scope))
    }
    case 'conditional': {
      return evaluateNode(node.test, scope)
        ? evaluateNode(node.consequent, scope)
        : evaluateNode(node.alternate, scope)
    }
    case 'call': {
      return FUNCTIONS[node.name](...node.args.map((arg) => evaluateNode(arg, scope)))
    }
    default: {
      throw new FormulaError('Unknown formula part')
    }
  }
}

/** Evaluates one formula against named values. Throws FormulaError on bad syntax or unknown names. */
export function evaluateFormula(source, scope) {
  const result = evaluateNode(parse(String(source || '0')), scope)
  return Number.isFinite(result) ? result : 0
}

/** The syntax error in a formula, or null. Used by Studio to flag a broken formula before publishing. */
export function formulaSyntaxError(source) {
  try {
    parse(String(source || ''))
    return null
  } catch (error) {
    return error instanceof FormulaError ? error.message : 'Invalid formula'
  }
}
