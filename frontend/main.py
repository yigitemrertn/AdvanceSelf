import flet as ft
import time
import json
import os

CONFIG_FILE = "user_config.json"

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_config(config_data):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config_data, f, indent=4)

def is_config_complete():
    config = load_config()
    required_keys = ["gender", "height", "weight", "face_shape", "preferred_style"]
    for key in required_keys:
        if not config.get(key):
            return False
    return True

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

def build_survey_view(page: ft.Page) -> ft.View:
    face_shapes = ["Oval", "Round", "Square", "Heart", "Diamond", "Oblong", "Triangle"]
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
            border_radius=12,
            border_color="#d8cdad",
            cursor_color="#f85e5e",
            bgcolor="#ffffff",
            color="#222222",
            width=320,
            keyboard_type=ft.KeyboardType.NUMBER if numeric else ft.KeyboardType.TEXT,
            text_style=ft.TextStyle(font_family="Inria Serif", size=16),
            label_style=ft.TextStyle(font_family="Inria Serif", color="#888888"),
            content_padding=ft.Padding(left=20, top=15, right=20, bottom=15),
        )
        
    def make_searchable_dropdown(label, options):
        text_field = ft.TextField(
            label=label,
            border_radius=12,
            border_color="#d8cdad",
            cursor_color="#f85e5e",
            bgcolor="#ffffff",
            color="#222222",
            width=320,
            text_style=ft.TextStyle(font_family="Inria Serif", size=16),
            label_style=ft.TextStyle(font_family="Inria Serif", color="#888888"),
            content_padding=ft.Padding(left=20, top=15, right=20, bottom=15),
        )
        
        list_view = ft.ListView(spacing=0, height=150)
        
        container = ft.Container(
            content=list_view,
            width=320,
            bgcolor="#ffffff",
            border=ft.Border.all(1, "#f0f0f0"),
            border_radius=12,
            visible=False,
            padding=5,
            shadow=ft.BoxShadow(
                blur_radius=15,
                color=ft.Colors.with_opacity(0.1, "#000000"),
                offset=ft.Offset(0, 5)
            ),
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
                        content=ft.Text(opt, color="#222222", font_family="Inria Serif", size=15),
                        padding=ft.Padding(left=15, top=12, right=15, bottom=12),
                        on_click=make_click(opt),
                        ink=True,
                        border_radius=8
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
        
        return ft.Column([text_field, container], spacing=0, horizontal_alignment=ft.CrossAxisAlignment.CENTER), text_field

    gender_group = ft.RadioGroup(
        content=ft.Row(
            alignment=ft.MainAxisAlignment.CENTER,
            spacing=40,
            controls=[
                ft.Radio(value="male", label="Male", fill_color="#f85e5e", label_style=ft.TextStyle(font_family="Inria Serif", size=16, color="#444444")),
                ft.Radio(value="female", label="Female", fill_color="#f85e5e", label_style=ft.TextStyle(font_family="Inria Serif", size=16, color="#444444"))
            ]
        )
    )
    
    height_field = make_field("Height (cm)", numeric=True)
    weight_field = make_field("Weight (kg)", numeric=True)
    
    face_col, face_field = make_searchable_dropdown("Face Shape", face_options)
    style_col, style_field = make_searchable_dropdown("Preferred Style", style_options)

    def on_complete(e):
        if not gender_group.value or not height_field.value or not weight_field.value or not face_field.value or not style_field.value:
            snack = ft.SnackBar(
                content=ft.Text("Please fill all fields before completing!", color="#ffffff", font_family="Inria Serif"),
                bgcolor="#f85e5e",
                behavior=ft.SnackBarBehavior.FLOATING,
                margin=20
            )
            try:
                page.open(snack)
            except AttributeError:
                page.snack_bar = snack
                page.snack_bar.open = True
                page.update()
            return

        config_data = load_config()
        config_data.update({
            "gender": gender_group.value,
            "height": height_field.value,
            "weight": weight_field.value,
            "face_shape": face_field.value,
            "preferred_style": style_field.value
        })
        save_config(config_data)
        page.go("/main")

    complete_btn = ft.Container(
        content=ft.Text("Complete Profile", size=18, font_family="Inria Serif", color="#ffffff", weight=ft.FontWeight.W_600),
        alignment=ft.Alignment(0, 0),
        width=320,
        height=55,
        bgcolor="#f85e5e",
        border_radius=12,
        ink=True,
        on_click=on_complete,
        shadow=ft.BoxShadow(
            blur_radius=15,
            color=ft.Colors.with_opacity(0.4, "#f85e5e"),
            offset=ft.Offset(0, 5)
        )
    )

    form_content = ft.Column(
        alignment=ft.MainAxisAlignment.CENTER,
        horizontal_alignment=ft.CrossAxisAlignment.CENTER,
        spacing=20,
        controls=[
            ft.Container(
                content=ft.Column(
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                    spacing=5,
                    controls=[
                        serif("Advance Self", size=42),
                        ft.Text("Craft your perfect aesthetic.", size=17, color="#777777", font_family="Inria Serif", italic=True),
                    ]
                ),
                padding=ft.Padding(left=0, top=0, right=0, bottom=15)
            ),
            gender_group,
            height_field,
            weight_field,
            face_col,
            style_col,
            ft.Container(height=10),
            complete_btn
        ]
    )

    survey_card = ft.Container(
        content=form_content,
        bgcolor="#ffffff",
        border_radius=24,
        padding=ft.Padding(left=50, top=40, right=50, bottom=40),
        width=480,
        shadow=ft.BoxShadow(
            spread_radius=0,
            blur_radius=30,
            color=ft.Colors.with_opacity(0.08, "#000000"),
            offset=ft.Offset(0, 10)
        ),
        alignment=ft.Alignment(0, 0)
    )

    return ft.View(
        route="/survey",
        padding=0,
        scroll=ft.ScrollMode.AUTO,
        controls=[
            ft.Container(
                expand=True,
                alignment=ft.Alignment(0, 0),
                padding=ft.Padding(0, 40, 0, 40),
                gradient=ft.LinearGradient(
                    begin=ft.Alignment(-1, -1),
                    end=ft.Alignment(1, 1),
                    colors=["#faf9f6", "#d8cdad"]
                ),
                content=survey_card
            )
        ]
    )

def build_main_view(page: ft.Page) -> ft.View:
    # HEADER
    header = ft.Container(
        left=0, right=0, top=0,
        bgcolor=HEADER_BG,
        padding=ft.Padding(left=40, top=20, right=40, bottom=20),
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
                            padding=ft.Padding(left=25, top=8, right=25, bottom=8),
                            border_radius=20,
                            on_click=lambda _: page.go("/survey")
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
        padding=ft.Padding(left=40, top=20, right=40, bottom=20),
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
        
        if page.route == "/survey":
            page.views.append(build_survey_view(page))
        elif page.route == "/main":
            page.views.append(build_main_view(page))
            
        page.update()

    page.on_route_change = route_change
    if is_config_complete():
        page.go("/main")
    else:
        page.go("/survey")

if __name__ == "__main__":
    ft.run(main)