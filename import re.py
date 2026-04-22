import re

def parse_equation(eq):
    eq = eq.replace(" ", "")
    left, right = eq.split("=")

    def get_val(var):
        match = re.search(r'([+-]?\d*)' + var, left)
        if match:
            val = match.group(1)
            if val in ("", "+"): return 1
            if val == "-": return -1
            return float(val)
        return 0

    return [get_val('x'), get_val('y'), get_val('z'), float(right)]


def safe_input(prompt, default):
    try:
        val = input(prompt)
        return val if val.strip() != "" else default
    except:
        return default


def relaxation_method():
    print("Enter equations (press ENTER to use default)")

    # ===== SAFE INPUT =====
    eq1 = safe_input("Equation 1: ", "8x + y + z = 8")
    eq2 = safe_input("Equation 2: ", "2x + 4y + z = 4")
    eq3 = safe_input("Equation 3: ", "x + 3y + 5z = 5")

    x = float(safe_input("x initial: ", "0"))
    y = float(safe_input("y initial: ", "0"))
    z = float(safe_input("z initial: ", "0"))

    iterations = int(safe_input("Iterations: ", "13"))

    # ===== PROCESS =====
    A = []
    b = []

    for eq in [eq1, eq2, eq3]:
        vals = parse_equation(eq)
        A.append(vals[:3])
        b.append(vals[3])

    print("\nIter |    x    |    y    |    z")
    print("-"*40)

    for i in range(iterations):
        r1 = b[0] - (A[0][0]*x + A[0][1]*y + A[0][2]*z)
        r2 = b[1] - (A[1][0]*x + A[1][1]*y + A[1][2]*z)
        r3 = b[2] - (A[2][0]*x + A[2][1]*y + A[2][2]*z)

        x += r1 / A[0][0]
        y += r2 / A[1][1]
        z += r3 / A[2][2]

        print(f"{i+1:4d} | {x:7.4f} | {y:7.4f} | {z:7.4f}")

    print("\nFinal Answer:")
    print(f"x = {x:.4f}, y = {y:.4f}, z = {z:.4f}")


if __name__ == "_main_":
    relaxation_method()


