import flet as ft
import time
import json

HEADER_BG = "#d8cdad"
TEXT_RED = "#f85e5e"
CARD_BG = "#fa4040"
TEXT_DARK = "#222222"

def serif(text, size=31, color=TEXT_RED, text_align=ft.TextAlign.CENTER):
    return ft.Text(text, size=size, color=color, font_family="Inria Serif", text_align=text_align)
    
def sans(text, size=18, color=TEXT_DARK, text_align=ft.TextAlign.CENTER):
    return ft.Text(text, size=size, color=color, font_family="Inria Serif", text_align=text_align)

def red_card():
    return ft.Container(
        bgcolor=CARD_BG,
        width=240,
        height=320,
        border_radius=8,
        alignment=ft.Alignment(0, 0),
        content=ft.Text("this is a card\ngoing to add\na picture", size=19, color="#ffffff", text_align=ft.TextAlign.CENTER, font_family="Inria Serif")
    )

def card_row():
    return ft.Row(
        alignment=ft.MainAxisAlignment.CENTER,
        spacing=40,
        wrap=True,
        controls=[red_card(), red_card(), red_card()]
    )

def build_login_view(page: ft.Page) -> ft.View:
    username_input = ft.TextField(
        label="Username",
        border_radius=8,
        border_color=HEADER_BG,
        cursor_color=TEXT_RED,
        width=300,
        text_style=ft.TextStyle(font_family="Inria Serif"),
        label_style=ft.TextStyle(font_family="Inria Serif", color=TEXT_DARK)
    )
    
    password_input = ft.TextField(
        label="Password",
        password=True,
        can_reveal_password=True,
        border_radius=8,
        border_color=HEADER_BG,
        cursor_color=TEXT_RED,
        width=300,
        text_style=ft.TextStyle(font_family="Inria Serif"),
        label_style=ft.TextStyle(font_family="Inria Serif", color=TEXT_DARK)
    )

    login_btn = ft.ElevatedButton(
        bgcolor=CARD_BG,
        width=300,
        height=50,
        style=ft.ButtonStyle(
            shape=ft.RoundedRectangleBorder(radius=8),
            color="#ffffff",
        ),
        content=ft.Text("Login / Sign Up", size=19, font_family="Inria Serif", color="#ffffff"),
        on_click=lambda _: page.go("/survey")
    )

    content = ft.Column(
        alignment=ft.MainAxisAlignment.CENTER,
        horizontal_alignment=ft.CrossAxisAlignment.CENTER,
        spacing=20,
        controls=[
            serif("Advance Self", size=45),
            ft.Text("Improve Your Image", size=21, color=TEXT_DARK, opacity=0.7, font_family="Inria Serif", italic=True),
            ft.Container(height=30),
            username_input,
            password_input,
            ft.Container(height=10),
            login_btn
        ]
    )

    return ft.View(
        route="/login",
        padding=0,
        bgcolor="#e6e6e6",
        controls=[
            ft.Container(
                expand=True,
                alignment=ft.Alignment(0, 0),
                content=content
            )
        ]
    )

def build_survey_view(page: ft.Page) -> ft.View:
    face_shapes = ["Oval", "Round", "Square", "Heart", "Diamond", "Oblong", "Triangle"]
    
    # We will just pass lists of strings to our custom dropdown
    face_options = face_shapes
    try:
        with open("backend/styles.json", "r", encoding="utf-8") as f:
            styles_data = json.load(f)
            style_options = [d["name"] for d in styles_data if "name" in d]
    except Exception:
        style_options = ["Error loading styles"]

    def make_field(label, numeric=False):
        return ft.TextField(
            label=label,
            border_radius=8, border_color=HEADER_BG, cursor_color=TEXT_RED,
            width=300,
            keyboard_type=ft.KeyboardType.NUMBER if numeric else ft.KeyboardType.TEXT,
            text_style=ft.TextStyle(font_family="Inria Serif"),
            label_style=ft.TextStyle(font_family="Inria Serif", color=TEXT_DARK)
        )
        
    def make_searchable_dropdown(label, options):
        text_field = ft.TextField(
            label=label,
            border_radius=8, border_color=HEADER_BG, cursor_color=TEXT_RED,
            width=300,
            text_style=ft.TextStyle(font_family="Inria Serif"),
            label_style=ft.TextStyle(font_family="Inria Serif", color=TEXT_DARK)
        )
        
        list_view = ft.ListView(spacing=0, height=150)
        
        container = ft.Container(
            content=list_view,
            width=300,
            bgcolor="#ffffff",
            border=ft.border.all(1, HEADER_BG),
            border_radius=8,
            visible=False,
            padding=5
        )
        
        def select_option(opt):
            text_field.value = opt
            container.visible = False
            text_field.update()
            container.update()

        def update_options(search_term):
            filtered = [opt for opt in options if search_term.lower() in opt.lower()]
            list_view.controls.clear()
            for opt in filtered:
                def make_click(o):
                    return lambda _: select_option(o)
                list_view.controls.append(
                    ft.Container(
                        content=ft.Text(opt, color=TEXT_DARK, font_family="Inria Serif", size=16),
                        padding=10,
                        on_click=make_click(opt),
                        ink=True,
                        border_radius=4
                    )
                )

        def on_change(e):
            val = e.control.value or ""
            update_options(val)
            container.visible = True if len(list_view.controls) > 0 else False
            container.update()
            
        def on_focus(e):
            val = e.control.value or ""
            update_options(val)
            container.visible = True if len(list_view.controls) > 0 else False
            container.update()
            
        text_field.on_change = on_change
        text_field.on_focus = on_focus
        
        return ft.Column([text_field, container], spacing=0, horizontal_alignment=ft.CrossAxisAlignment.CENTER)

    content = ft.Column(
        alignment=ft.MainAxisAlignment.CENTER,
        horizontal_alignment=ft.CrossAxisAlignment.CENTER,
        spacing=15,
        controls=[
            serif("Advance Self", size=45),
            ft.Text("Tell us about yourself", size=21, color=TEXT_DARK, opacity=0.7, font_family="Inria Serif", italic=True),
            ft.Container(height=10),
            
            ft.RadioGroup(
                content=ft.Row(
                    alignment=ft.MainAxisAlignment.CENTER,
                    controls=[
                        ft.Radio(value="male", label="Male", fill_color=TEXT_RED),
                        ft.Radio(value="female", label="Female", fill_color=TEXT_RED)
                    ]
                )
            ),
            
            make_field("Height (cm)", numeric=True),
            make_field("Weight (kg)", numeric=True),
            make_field("Age", numeric=True),
            
            make_searchable_dropdown("Face Shape", face_options),
            make_searchable_dropdown("Preferred Style", style_options),
            
            ft.Container(height=10),
            ft.ElevatedButton(
                bgcolor=CARD_BG,
                width=300, height=50,
                style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=8), color="#ffffff"),
                content=ft.Text("Complete", size=19, font_family="Inria Serif", color="#ffffff"),
                on_click=lambda _: page.go("/main")
            )
        ]
    )

    return ft.View(
        route="/survey",
        padding=0,
        bgcolor="#e6e6e6",
        scroll=ft.ScrollMode.AUTO,
        controls=[
            ft.Container(
                expand=True,
                alignment=ft.Alignment(0, 0),
                padding=ft.Padding(0, 40, 0, 40),
                content=content
            )
        ]
    )

def build_main_view(page: ft.Page) -> ft.View:
    # HEADER
    header = ft.Container(
        left=0, right=0, top=0,
        bgcolor=HEADER_BG,
        padding=ft.Padding.symmetric(horizontal=40, vertical=20),
        content=ft.Row(
            alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
            controls=[
                ft.Row(
                    spacing=10,
                    vertical_alignment=ft.CrossAxisAlignment.END,
                    controls=[
                        ft.Text("Advance Self", size=35, color="#ffffff", font_family="Inria Serif"),
                        ft.Text("Improve Your Image", size=21, color="#ffffff", opacity=0.7, font_family="Inria Serif", italic=True),
                    ]
                ),
                ft.Row(
                    spacing=15,
                    controls=[
                        ft.Container(
                            content=ft.Text("Survey", color="#ffffff", size=18, font_family="Inria Serif"),
                            bgcolor="#c4b281",
                            padding=ft.Padding.symmetric(horizontal=25, vertical=8),
                            border_radius=20,
                            on_click=lambda _: page.go("/survey")
                        ),
                        ft.Container(
                            content=ft.Text("i", color="#ffffff", size=21, font_family="Inria Serif", italic=True),
                            bgcolor="#c4b281",
                            width=36,
                            height=36,
                            border_radius=18,
                            alignment=ft.Alignment(0, 0),
                            on_click=lambda _: page.go("/login")
                        ),
                    ]
                )
            ]
        )
    )

    # FOOTER
    footer = ft.Container(
        left=0, right=0, bottom=0,
        bgcolor=HEADER_BG,
        padding=ft.Padding.symmetric(horizontal=40, vertical=20),
        alignment=ft.Alignment(1, 0),
        content=ft.Row(
            alignment=ft.MainAxisAlignment.END,
            spacing=10,
            vertical_alignment=ft.CrossAxisAlignment.END,
            controls=[
                ft.Text("Advance Self", size=29, color="#ffffff", font_family="Inria Serif"),
                ft.Text("Improve Your Image", size=18, color="#ffffff", opacity=0.7, font_family="Inria Serif", italic=True),
            ]
        )
    )

    state = {"current_section": 0, "last_scroll_time": 0.0}
    
    def section_container(key, content, index):
        return ft.Container(
            key=key,
            left=0, right=0, top=0, bottom=0,
            alignment=ft.Alignment(0, 0),
            content=content,
            offset=ft.Offset(0, index),
            animate_offset=ft.Animation(600, ft.AnimationCurve.DECELERATE)
        )

    sections = [
        section_container("sec_0", ft.Column(
            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
            alignment=ft.MainAxisAlignment.CENTER,
            spacing=15,
            controls=[
                serif("Welcome dear, {username}", size=39),
                ft.Text(
                    spans=[
                        ft.TextSpan("Here some advises and what you should do about your image,\nIt looks like you want to be dressed as ", ft.TextStyle(font_family="Inria Serif", color=TEXT_DARK, size=19)),
                        ft.TextSpan("[preferred style of users].", ft.TextStyle(font_family="Inria Serif", color=TEXT_RED, size=19)),
                    ],
                    text_align=ft.TextAlign.CENTER
                ),
                ft.Container(height=5),
                ft.Text(
                    spans=[
                        ft.TextSpan("Maybe you could wanna know what is your style:\n", ft.TextStyle(font_family="Inria Serif", color=TEXT_DARK, size=19)),
                        ft.TextSpan("[description of style]", ft.TextStyle(font_family="Inria Serif", color=TEXT_RED, size=19)),
                    ],
                    text_align=ft.TextAlign.CENTER
                ),
            ]
        ), 0),
        section_container("sec_1", ft.Column(
            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
            alignment=ft.MainAxisAlignment.CENTER,
            spacing=30,
            controls=[
                serif("Let's Start From the Head", size=35),
                sans("If you wanna change your image you should know that\npeople is going to look at your face at the first place.\nThat's why we are going to change your hairstyle.", size=19),
                sans("(No worries this is not an looksmax app you're beautiful as what you are.)", size=19),
                sans("According to your face shape here some hairstyles would look good on you:", size=19),
                ft.Container(height=10),
                card_row()
            ]
        ), 1),
        section_container("sec_2", ft.Column(
            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
            alignment=ft.MainAxisAlignment.CENTER,
            spacing=30,
            controls=[
                serif("It's Time for Outfits Choice", size=35),
                sans("Second and the most important part of your change.", size=19),
                sans("Outfit choices is might be complicated at the start but no worries AdvanceSelf got your back.", size=19),
                ft.Text(
                    spans=[
                        ft.TextSpan("you can wear this kind of nut shells for guarantee: ", ft.TextStyle(font_family="Inria Serif", color=TEXT_DARK, size=19)),
                        ft.TextSpan("[cuts]", ft.TextStyle(font_family="Inria Serif", color=TEXT_RED, size=19)),
                    ],
                    text_align=ft.TextAlign.CENTER
                ),
                sans("And for the color palette you can wear clothes preferably this color(s):\n(you can combine the color with your free will)", size=19),
                ft.Row(alignment=ft.MainAxisAlignment.CENTER, spacing=6, controls=[
                    sans("colors will show up at here in squares like", size=19),
                    ft.Container(width=16, height=16, bgcolor="red"),
                    ft.Container(width=16, height=16, bgcolor="green"),
                    ft.Container(width=16, height=16, bgcolor="blue"),
                    ft.Container(width=16, height=16, bgcolor="purple"),
                    sans("but not that small it is going to BIG", size=19),
                ]),
                sans("If you're having trouble at the combine choice here the other people in your style dressed like this:", size=19),
                ft.Container(height=10),
                card_row()
            ]
        ), 2),
        section_container("sec_3", ft.Column(
            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
            alignment=ft.MainAxisAlignment.CENTER,
            spacing=30,
            controls=[
                serif("Little Deatils with Accesoires", size=35),
                sans("You don't have to but why wont you?", size=19),
                sans("For some styles it is important to have accesoires.\nIt is adding a different athmosphere isn't it?", size=19),
                sans("Here some accesoires for your style:", size=19),
                ft.Container(height=10),
                card_row()
            ]
        ), 3)
    ]

    body_stack = ft.Stack(
        controls=sections,
        clip_behavior=ft.ClipBehavior.HARD_EDGE
    )

    async def handle_scroll(e: ft.ScrollEvent):
        now = time.time()
        # 800ms debounce to prevent rapid skipping
        if now - state["last_scroll_time"] < 0.8:
            return
            
        direction = 1 if e.scroll_delta.y > 0 else -1
        new_section = state["current_section"] + direction
        
        if 0 <= new_section <= 3:
            state["current_section"] = new_section
            state["last_scroll_time"] = now
            for i, sec in enumerate(sections):
                sec.offset = ft.Offset(0, i - new_section)
                sec.update()

    body = ft.GestureDetector(
        on_scroll=handle_scroll,
        content=body_stack,
        expand=True
    )

    return ft.View(
        route="/main",
        padding=0,
        bgcolor="#e6e6e6",
        controls=[
            ft.Stack(
                expand=True,
                controls=[
                    ft.Container(
                        left=0, right=0, top=0, bottom=0,
                        content=body
                    ),
                    header,
                    footer
                ]
            )
        ]
    )

def main(page: ft.Page):
    page.title = "Advance Self"
    page.theme_mode = ft.ThemeMode.LIGHT
    page.fonts = {
        "Inria Serif": "https://raw.githubusercontent.com/google/fonts/main/ofl/inriaserif/InriaSerif-Regular.ttf",
    }
    
    def route_change(route):
        page.views.clear()
        
        if page.route == "/login":
            page.views.append(build_login_view(page))
        elif page.route == "/survey":
            page.views.append(build_survey_view(page))
        elif page.route == "/main":
            page.views.append(build_main_view(page))
            
        page.update()

    page.on_route_change = route_change
    page.go("/login")

if __name__ == "__main__":
    ft.run(main)