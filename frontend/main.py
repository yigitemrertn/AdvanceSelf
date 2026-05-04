import flet as ft
import time

def main(page: ft.Page):
    page.title = "Advance Self"
    page.bgcolor = "#e6e6e6"
    page.padding = 0
    page.theme_mode = ft.ThemeMode.LIGHT
    page.scroll = None
    page.fonts = {
        "Inria Serif": "https://raw.githubusercontent.com/google/fonts/main/ofl/inriaserif/InriaSerif-Regular.ttf",
    }
        
    HEADER_BG = "#d8cdad"
    TEXT_RED = "#f85e5e"
    CARD_BG = "#fa4040"
    TEXT_DARK = "#222222"
    
    def serif(text, size=31, color=TEXT_RED, text_align=ft.TextAlign.CENTER):
        return ft.Text(text, size=size, color=color, font_family="Inria Serif", text_align=text_align)
        
    def sans(text, size=18, color=TEXT_DARK, text_align=ft.TextAlign.CENTER):
        return ft.Text(text, size=size, color=color, font_family="Inria Serif", text_align=text_align)

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
                        ),
                        ft.Container(
                            content=ft.Text("i", color="#ffffff", size=21, font_family="Inria Serif", italic=True),
                            bgcolor="#c4b281",
                            width=36,
                            height=36,
                            border_radius=18,
                            alignment=ft.Alignment(0, 0),
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

    # Use a Stack to ensure body slides UNDER the header and footer overlay.
    page.add(
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
    )
    
if __name__ == "__main__":
    ft.run(main)