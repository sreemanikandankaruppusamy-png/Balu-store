import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

pdf_path = os.path.join(os.path.dirname(__file__), "Sri_Balu_Store_Client_Handover.pdf")

doc = SimpleDocTemplate(
    pdf_path,
    pagesize=letter,
    rightMargin=36,
    leftMargin=36,
    topMargin=32,
    bottomMargin=32
)

styles = getSampleStyleSheet()

primary_color = colors.HexColor("#1e293b")   # Slate 800
brand_blue = colors.HexColor("#1d4ed8")      # Blue 700
brand_teal = colors.HexColor("#0f766e")      # Teal 700
light_bg = colors.HexColor("#f8fafc")        # Slate 50
border_color = colors.HexColor("#cbd5e1")    # Slate 300

title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=18,
    leading=22,
    textColor=primary_color,
    alignment=TA_CENTER
)

subtitle_style = ParagraphStyle(
    'DocSubtitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=9.5,
    leading=13,
    textColor=brand_blue,
    alignment=TA_CENTER
)

h1_style = ParagraphStyle(
    'SectionHeading',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=10.5,
    leading=14,
    textColor=brand_blue,
    spaceAfter=4
)

body_style = ParagraphStyle(
    'BodyDark',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=11.5,
    textColor=colors.HexColor("#334155")
)

link_style = ParagraphStyle(
    'LinkText',
    parent=body_style,
    fontName='Helvetica-Bold',
    fontSize=8.5,
    textColor=colors.HexColor("#0369a1")
)

code_style = ParagraphStyle(
    'CodeText',
    parent=body_style,
    fontName='Courier-Bold',
    fontSize=8.5,
    textColor=colors.HexColor("#0f172a")
)

table_header_style = ParagraphStyle(
    'TableHeader',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=8.5,
    leading=11,
    textColor=colors.white
)

elements = []

# Title & Header
elements.append(Paragraph("SRI BALU ELECTRONICS &amp; FURNITURES", title_style))
elements.append(Spacer(1, 2))
elements.append(Paragraph("CLIENT DELIVERY &amp; SYSTEM HANDOVER DOCUMENT", subtitle_style))
elements.append(Spacer(1, 6))
elements.append(HRFlowable(width="100%", thickness=1.5, color=brand_blue, spaceBefore=0, spaceAfter=8))

# Introduction
intro_text = (
    "This official handover document contains live deployment links, access credentials, and technical specifications "
    "for the <b>Sri Balu Electronics &amp; Furnitures</b> e-commerce platform. All systems are live, globally hosted on Vercel, "
    "and synchronized in real-time with MongoDB Atlas Cloud."
)
elements.append(Paragraph(intro_text, body_style))
elements.append(Spacer(1, 8))

# Section 1: Live Deployment Links
elements.append(Paragraph("1. Live Deployment &amp; Access Portals", h1_style))

links_data = [
    [
        Paragraph("Portal", table_header_style),
        Paragraph("Live Website URL", table_header_style),
        Paragraph("Description", table_header_style)
    ],
    [
        Paragraph("<b>Customer Store</b>", body_style),
        Paragraph("<b>https://balu-storecom.vercel.app</b>", link_style),
        Paragraph("Public storefront for customers to browse, filter, cart &amp; checkout.", body_style)
    ],
    [
        Paragraph("<b>Admin Dashboard</b>", body_style),
        Paragraph("<b>https://balu-storecom.vercel.app/admin</b>", link_style),
        Paragraph("Store management dashboard to add products, edit prices &amp; manage orders.", body_style)
    ]
]

t_links = Table(links_data, colWidths=[110, 220, 210])
t_links.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), brand_blue),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, light_bg]),
    ('GRID', (0, 0), (-1, -1), 0.5, border_color),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
elements.append(t_links)
elements.append(Spacer(1, 8))

# Section 2: Admin Login Credentials
elements.append(Paragraph("2. Administrator Credentials", h1_style))

cred_data = [
    [Paragraph("Item", table_header_style), Paragraph("Credential / Value", table_header_style), Paragraph("Notes", table_header_style)],
    [Paragraph("<b>Admin URL</b>", body_style), Paragraph("https://balu-storecom.vercel.app/admin", link_style), Paragraph("Direct admin management portal", body_style)],
    [Paragraph("<b>Username</b>", body_style), Paragraph("Admin", code_style), Paragraph("Default administrator username", body_style)],
    [Paragraph("<b>Password</b>", body_style), Paragraph("Admin@123", code_style), Paragraph("Standard management password", body_style)],
    [Paragraph("<b>API Secret Token</b>", body_style), Paragraph("admin-secret-token", code_style), Paragraph("Secures all write API requests", body_style)],
]

t_cred = Table(cred_data, colWidths=[110, 220, 210])
t_cred.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), primary_color),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, light_bg]),
    ('GRID', (0, 0), (-1, -1), 0.5, border_color),
    ('TOPPADDING', (0, 0), (-1, -1), 3.5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
]))
elements.append(t_cred)
elements.append(Spacer(1, 8))

# Section 3: Delivered Capabilities
elements.append(Paragraph("3. Delivered Capabilities &amp; Features", h1_style))

features_text = (
    "• <b>Real-time Cloud Sync</b>: Integrated with MongoDB Atlas. Product additions, price updates, and announcements reflect on the live customer storefront instantaneously.<br/>"
    "• <b>Catalog &amp; Product Management</b>: Add, edit, discount, or remove products across Electronics, Furnitures, Home Appliances, and RO Water Purifiers with image &amp; color options.<br/>"
    "• <b>Customer Ordering &amp; Cart</b>: Interactive shopping cart, instant pricing calculator with discounts, and customer order placement.<br/>"
    "• <b>Store Banner &amp; Announcements</b>: Change promotional announcements anytime from the Admin panel without modifying code.<br/>"
    "• <b>Mobile &amp; Responsive</b>: 100% responsive user interface optimized for smartphones, tablets, laptops, and desktop screens."
)
elements.append(Paragraph(features_text, body_style))
elements.append(Spacer(1, 8))

# Section 4: Technical Architecture Summary
elements.append(Paragraph("4. Technical Specifications &amp; Infrastructure", h1_style))

tech_data = [
    [Paragraph("Layer", table_header_style), Paragraph("Technology / Service", table_header_style), Paragraph("Specification", table_header_style)],
    [Paragraph("<b>Frontend UI</b>", body_style), Paragraph("HTML5 / Vanilla CSS3 / Modern JS", body_style), Paragraph("Ultra-fast, zero external dependency load", body_style)],
    [Paragraph("<b>API Layer</b>", body_style), Paragraph("Node.js &amp; TypeScript Serverless", body_style), Paragraph("Global Edge deployment on Vercel", body_style)],
    [Paragraph("<b>Database</b>", body_style), Paragraph("MongoDB Atlas Cloud Database", body_style), Paragraph("Persistent cloud storage with auto backups", body_style)],
    [Paragraph("<b>Hosting &amp; SSL</b>", body_style), Paragraph("Vercel Edge CDN (HTTPS)", body_style), Paragraph("99.9% uptime, automatic SSL certificate", body_style)],
]

t_tech = Table(tech_data, colWidths=[110, 220, 210])
t_tech.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), brand_teal),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, light_bg]),
    ('GRID', (0, 0), (-1, -1), 0.5, border_color),
    ('TOPPADDING', (0, 0), (-1, -1), 3.5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
]))
elements.append(t_tech)
elements.append(Spacer(1, 10))

# Footer
footer_text = (
    "<b>Project Status:</b> Completed &amp; Handed Over &nbsp;|&nbsp; "
    "<b>Author:</b> Sreemanikandan Karuppusamy &nbsp;|&nbsp; "
    "<b>Client:</b> Sri Balu Electronics &amp; Furnitures"
)
elements.append(HRFlowable(width="100%", thickness=0.8, color=border_color, spaceBefore=0, spaceAfter=6))
elements.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=styles['Normal'], fontName='Helvetica', fontSize=8, textColor=colors.HexColor("#64748b"), alignment=TA_CENTER)))

doc.build(elements)
print("PDF generated successfully:", pdf_path)
