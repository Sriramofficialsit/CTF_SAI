import json
from fpdf import FPDF

with open("data/employees.json") as f:
    employees = json.load(f)

OUT = "public/files"

def new_pdf(title):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.multi_cell(0, 10, title)
    pdf.ln(4)
    pdf.set_font("Helvetica", "", 11)
    return pdf

# 1. Company Brochure (decoy, harmless)
pdf = new_pdf("Velunox Technologies - Company Brochure 2026")
pdf.multi_cell(0, 7,
    "Velunox Technologies builds industrial IoT sensor networks and cloud "
    "monitoring dashboards for manufacturing plants worldwide.\n\n"
    "Founded 2016 | Headquarters: Rotterdam | Satellite office: Austin, TX\n\n"
    "Product lines: VibraSense vibration sensors, ThermalGuard temperature "
    "monitoring, CloudDeck analytics dashboard.\n\n"
    "For sales inquiries, contact sales@velunox.test."
)
pdf.output(f"{OUT}/Company_Brochure.pdf")

# 2. Annual Report (decoy, harmless)
pdf = new_pdf("Velunox Technologies - Annual Report 2025")
pdf.multi_cell(0, 7,
    "Fiscal Year 2025 Highlights\n\n"
    "Revenue: EUR 18.4M (up 22% YoY)\n"
    "New clients onboarded: 37\n"
    "Headcount: 214 employees across Rotterdam and Austin offices\n\n"
    "2026 Outlook: continued expansion into North American manufacturing "
    "clients, with planned headcount growth in engineering and support."
)
pdf.output(f"{OUT}/Annual_Report_2025.pdf")

# 3. Q3 Onboarding Directory (KEY - employee roster)
pdf = new_pdf("Velunox Technologies - Q3 Onboarding Directory (Internal)")
pdf.multi_cell(0, 7,
    "Internal distribution only. This directory lists employee IDs for the "
    "Q3 onboarding cohort and current department assignments.\n"
)
pdf.ln(2)
pdf.set_font("Helvetica", "B", 11)
pdf.cell(35, 8, "Employee ID", border=1)
pdf.cell(55, 8, "Name", border=1)
pdf.cell(45, 8, "Department", border=1)
pdf.cell(55, 8, "Role", border=1)
pdf.ln()
pdf.set_font("Helvetica", "", 11)
for e in employees:
    pdf.cell(35, 8, e["id"], border=1)
    pdf.cell(55, 8, e["name"], border=1)
    pdf.cell(45, 8, e["department"], border=1)
    pdf.cell(55, 8, e["role"], border=1)
    pdf.ln()
pdf.output(f"{OUT}/Q3_Onboarding_Directory.pdf")

# 4. IT Access Policy Memo (KEY - mentions the unlinked portal URL)
pdf = new_pdf("Velunox Technologies - IT Access Policy Memo")
pdf.multi_cell(0, 7,
    "Internal Memo - IT Department\n\n"
    "All staff with system administration privileges are reminded that "
    "password resets and account management for internal systems must be "
    "handled through the employee access portal at:\n\n"
    "https://portal-access.velunox-internal.test\n\n"
    "This portal is not linked from the public website or the internal "
    "wiki homepage. Bookmark it directly. For access issues, contact the "
    "IT Systems Administrator."
)
pdf.output(f"{OUT}/IT_Access_Policy_Memo.pdf")

print("Generated 4 PDFs")
