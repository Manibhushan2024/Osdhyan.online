import sys
import subprocess
import os

def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

try:
    from fpdf import FPDF
except ImportError:
    install('fpdf2')
    from fpdf import FPDF

class ResumePDF(FPDF):
    def section_title(self, title):
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(112, 48, 160) # Purple color
        self.cell(0, 6, title, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(112, 48, 160)
        self.line(self.get_x(), self.get_y(), self.get_x() + 190, self.get_y())
        self.ln(2)

    def job_header(self, title, date):
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(0, 0, 0)
        self.cell(130, 5, title, new_x="RIGHT", new_y="TOP")
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(112, 48, 160) # Purple dates for some accent
        self.cell(0, 5, date, align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(0, 0, 0)

    def bullet_point(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(0, 0, 0)
        self.cell(4, 5, "-", new_x="RIGHT", new_y="TOP")
        self.multi_cell(0, 5, text, new_x="LMARGIN", new_y="NEXT")

pdf = ResumePDF()
pdf.add_page()
pdf.set_margins(10, 10, 10)

# --- HEADER ---
pdf.set_font('Helvetica', 'B', 22)
pdf.set_text_color(112, 48, 160) # Main Name Purple
pdf.cell(0, 8, 'MANIBHUSHAN KUMAR', align='C', new_x="LMARGIN", new_y="NEXT")

pdf.set_font('Helvetica', 'B', 11)
pdf.set_text_color(70, 70, 70)
# Bridges technical background with specific job role
pdf.cell(0, 6, 'Cloud & AI Automation Engineer | Technical Voice Specialist', align='C', new_x="LMARGIN", new_y="NEXT")

# Centered Links with Clickable URLs
pdf.set_font('Helvetica', '', 10)
phone_email = "(+91) 9334892585 | manibhushank437@gmail.com | "
linkedin = "LinkedIn"
sep1 = " | "
github = "GitHub"
sep2 = " | "
portfolio = "dhanorix.vercel.app"

w_pe = pdf.get_string_width(phone_email)
w_li = pdf.get_string_width(linkedin)
w_s1 = pdf.get_string_width(sep1)
w_gh = pdf.get_string_width(github)
w_s2 = pdf.get_string_width(sep2)
w_po = pdf.get_string_width(portfolio)

total_w = w_pe + w_li + w_s1 + w_gh + w_s2 + w_po
start_x = (210 - total_w) / 2  # 210mm is A4 width

pdf.set_x(start_x)
pdf.set_text_color(0, 0, 0)
pdf.write(5, phone_email)

pdf.set_text_color(112, 48, 160) # Link Color Purple
pdf.write(5, linkedin, "https://www.linkedin.com/in/manibhushan-kumar-ab76831a0")

pdf.set_text_color(0, 0, 0)
pdf.write(5, sep1)

pdf.set_text_color(112, 48, 160) # Link Color Purple
pdf.write(5, github, "https://github.com/Manibhushan2024")

pdf.set_text_color(0, 0, 0)
pdf.write(5, sep2)

pdf.set_text_color(112, 48, 160) # Link Color Purple
pdf.write(5, portfolio, "https://dhanorix.vercel.app")

pdf.set_text_color(0, 0, 0)
pdf.ln(8)

# --- PROFESSIONAL SUMMARY ---
pdf.section_title('PROFESSIONAL SUMMARY')
pdf.set_font('Helvetica', '', 10)
summary = (
    "Results-driven Engineer with expertise in Cloud Automation, Database Management, and scalable AI data pipelines. "
    "Native Hindi and fluent English speaker equipped with a professional home studio (professional-grade mic, "
    "soundproofing, audio interface). Proven experience in handling strict data parameters and generating 100% "
    "accurate outputs. Eager to leverage a strong technical background, clear enunciation, and natural pacing "
    "to deliver high-quality verbatim audio data for advanced AI model training."
)
pdf.multi_cell(0, 5, summary, new_x="LMARGIN", new_y="NEXT")
pdf.ln(3)

# --- TECHNICAL & DATABASE SKILLS ---
pdf.section_title('TECHNICAL & AUDIO SKILLS')
pdf.set_font('Helvetica', 'B', 10)
pdf.cell(45, 5, 'Languages & Audio:', new_x="RIGHT", new_y="TOP")
pdf.set_font('Helvetica', '', 10)
pdf.multi_cell(0, 5, 'Native Hindi, Fluent English, Professional Home Studio Setup, Voice Acting (Neutral/Upbeat), Verbatim Reading.', new_x="LMARGIN", new_y="NEXT")

pdf.set_font('Helvetica', 'B', 10)
pdf.cell(45, 5, 'Databases & Cloud:', new_x="RIGHT", new_y="TOP")
pdf.set_font('Helvetica', '', 10)
pdf.multi_cell(0, 5, 'MySQL, PostgreSQL, AWS (RDS/EC2), Vercel, Docker, Git/GitHub CLI, CI/CD.', new_x="LMARGIN", new_y="NEXT")

pdf.set_font('Helvetica', 'B', 10)
pdf.cell(45, 5, 'Automation:', new_x="RIGHT", new_y="TOP")
pdf.set_font('Helvetica', '', 10)
pdf.multi_cell(0, 5, 'Python (Pandas), Prompt Engineering (Automated SQL Generation), Bash.', new_x="LMARGIN", new_y="NEXT")

pdf.set_font('Helvetica', 'B', 10)
pdf.cell(45, 5, 'App Architecture:', new_x="RIGHT", new_y="TOP")
pdf.set_font('Helvetica', '', 10)
pdf.multi_cell(0, 5, 'Next.js (Serverless Functions), REST APIs, Connection Pooling, Scalable Systems.', new_x="LMARGIN", new_y="NEXT")
pdf.ln(3)

# --- PROFESSIONAL EXPERIENCE ---
pdf.section_title('PROFESSIONAL EXPERIENCE')

pdf.job_header('WELDOTS | Automation Engineer', 'Nov 2025 - Present')
pdf.bullet_point("Designed and implemented an automated data ingestion system using Python, handling 1,000+ daily records with 100% data integrity.")
pdf.bullet_point("Utilized Prompt Engineering to generate complex automation scripts strictly adhering to exact formatting and data requirements.")
pdf.bullet_point("Optimized backend logic for order processing systems to reduce latency and improve database write speeds.")
pdf.bullet_point("Managed integration between Shiprocket APIs and internal databases ensuring real-time consistency.")
pdf.ln(2)

pdf.job_header('FREELANCE | Full Stack & Cloud Engineer', 'Mar 2023 - Present')
pdf.bullet_point("Architected and deployed scalable Next.js applications on Vercel, managing serverless database connections.")
pdf.bullet_point("Communicated complex technical requirements to partners, actively listening to constraints to deliver aligned project architectures.")
pdf.bullet_point("Designed normalized database schemas for e-commerce, ensuring strict data consistency and efficient retrieval.")
pdf.bullet_point("Optimized complex SQL queries for reporting dashboards, reducing load times by 40%.")
pdf.ln(2)

pdf.job_header('COURSE HERO | SME Computer Science', 'Oct 2023 - Nov 2024')
pdf.bullet_point("Analyzed and solved over 1,100 technical problems, delivering detailed step-by-step text explanations with perfect formatting and clarity.")
pdf.bullet_point("Demonstrated strong understanding of ACID properties and transaction management in theoretical and practical scenarios.")
pdf.ln(3)

# --- KEY PROJECTS ---
pdf.section_title('KEY PROJECTS')
pdf.bullet_point("AI Automation Suite: Developed a Python-based system to sanitize and process large datasets for automated reporting, emphasizing accurate data sets.")
pdf.bullet_point("Test Series Platform (Next.js, MySQL): Built a full-stack EdTech platform with bilingual test series, mock-test flows, and AI solution explanations.")
pdf.bullet_point("Rehabilitation Centre System (MySQL): Designed a robust database with conflict-detection algorithms (stored logic) to prevent appointment overlaps.")
pdf.ln(3)

# --- EDUCATION & CERTIFICATIONS ---
pdf.section_title('EDUCATION & CERTIFICATIONS')
pdf.set_font('Helvetica', 'B', 10)
pdf.cell(0, 5, 'B.Tech (CSE) | Gurukul Kangri Vishwavidyalaya | 2020 - 2024 | CGPA: 8.42', new_x="LMARGIN", new_y="NEXT")
pdf.set_font('Helvetica', '', 10)
pdf.bullet_point("Relevant Coursework: DBMS, Operating Systems, Data Structures, Cloud Computing.")
pdf.bullet_point("Certifications: Supervised Machine Learning, Software Development (Java).")
pdf.bullet_point("GATE 2025 Qualified: AIR 2971.")

file_name = r'c:\dev\test-series-platform\resume\Manibhushan_Kumar_Resume_Tailored.pdf'
pdf.output(file_name)
print("SUCCESS:", file_name)
