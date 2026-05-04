import flet as ft

def main(page: ft.Page):
    page.title = "Advance Self"
    page.bgcolor = "#e6e6e6"
    page.padding = 0
    page.theme_mode = ft.ThemeMode.LIGHT
    page.scroll = ft.ScrollMode.AUTO
    page.fonts = {
        "Inria Serif": "https://raw.githubusercontent.com/google/fonts/main/ofl/inriaserif/InriaSerif-Regular.ttf",
    }
        
    HEADER_BG = "#d8cdad"
    TEXT_RED = "#f85e5e"
    CARD_BG = "#fa4040"
    TEXT_DARK = "#222222"
    
    def serif(text, size=28, color=TEXT_RED, text_align=ft.TextAlign.CENTER):
        return ft.Text(text, size=size, color=color, font_family="Inria Serif", text_align=text_align)
        
    def sans(text, size=15, color=TEXT_DARK, text_align=ft.TextAlign.CENTER):
        return ft.Text(text, size=size, color=color, font_family="Inria Serif", text_align=text_align)

    # HEADER
    header = ft.Container(
        bgcolor=HEADER_BG,
        padding=ft.Padding.symmetric(horizontal=40, vertical=20),
        content=ft.Row(
            alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
            controls=[
                ft.Row(
                    spacing=10,
                    vertical_alignment=ft.CrossAxisAlignment.END,
                    controls=[
                        ft.Text("Advance Self", size=32, color="#ffffff", font_family="Inria Serif"),
                        ft.Text("Improve Your Image", size=18, color="#ffffff", opacity=0.7, font_family="Inria Serif", italic=True),
                    ]
                ),
                ft.Row(
                    spacing=15,
                    controls=[
                        ft.Container(
                            content=ft.Text("Survey", color="#ffffff", size=15, font_family="Inria Serif"),
                            bgcolor="#c4b281",
                            padding=ft.Padding.symmetric(horizontal=25, vertical=8),
                            border_radius=20,
                        ),
                        ft.Container(
                            content=ft.Text("i", color="#ffffff", size=18, font_family="Inria Serif", italic=True),
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
        bgcolor=HEADER_BG,
        padding=ft.Padding.symmetric(horizontal=40, vertical=20),
        alignment=ft.Alignment(1, 0),
        content=ft.Row(
            alignment=ft.MainAxisAlignment.END,
            spacing=10,
            vertical_alignment=ft.CrossAxisAlignment.END,
            controls=[
                ft.Text("Advance Self", size=26, color="#ffffff", font_family="Inria Serif"),
                ft.Text("Improve Your Image", size=15, color="#ffffff", opacity=0.7, font_family="Inria Serif", italic=True),
            ]
        )
    )

    def red_card():
        return ft.Container(
            bgcolor=CARD_BG,
            width=220,
            height=300,
            border_radius=8,
            alignment=ft.Alignment(0, 0),
            content=ft.Text("this is a card\ngoing to add\na picture", size=16, color="#ffffff", text_align=ft.TextAlign.CENTER, font_family="Inria Serif")
        )

    def card_row():
        return ft.Row(
            alignment=ft.MainAxisAlignment.CENTER,
            spacing=40,
            wrap=True,
            controls=[red_card(), red_card(), red_card()]
        )

    body = ft.Container(
        padding=ft.Padding.symmetric(vertical=80, horizontal=20),
        alignment=ft.Alignment(0, 0),
        content=ft.Column(
            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
            spacing=80,
            controls=[
                # Welcome Section
                ft.Column(
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                    spacing=15,
                    controls=[
                        serif("Welcome dear, {username}", size=36),
                        ft.Text(
                            spans=[
                                ft.TextSpan("Here some advises and what you should do about your image,\nIt looks like you want to be dressed as ", ft.TextStyle(font_family="Inria Serif", color=TEXT_DARK, size=16)),
                                ft.TextSpan("[preferred style of users].", ft.TextStyle(font_family="Inria Serif", color=TEXT_RED, size=16)),
                            ],
                            text_align=ft.TextAlign.CENTER
                        ),
                        ft.Container(height=5),
                        ft.Text(
                            spans=[
                                ft.TextSpan("Maybe you could wanna know what is your style:\n", ft.TextStyle(font_family="Inria Serif", color=TEXT_DARK, size=16)),
                                ft.TextSpan("[description of style]", ft.TextStyle(font_family="Inria Serif", color=TEXT_RED, size=16)),
                            ],
                            text_align=ft.TextAlign.CENTER
                        ),
                    ]
                ),

                # Head Section
                ft.Column(
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                    spacing=30,
                    controls=[
                        serif("Let's Start From the Head", size=32),
                        sans("If you wanna change your image you should know that\npeople is going to look at your face at the first place.\nThat's why we are going to change your hairstyle.", size=16),
                        sans("(No worries this is not an looksmax app you're beautiful as what you are.)", size=16),
                        sans("According to your face shape here some hairstyles would look good on you:", size=16),
                        ft.Container(height=10),
                        card_row()
                    ]
                ),

                # Outfits Section
                ft.Column(
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                    spacing=30,
                    controls=[
                        serif("It's Time for Outfits Choice", size=32),
                        sans("Second and the most important part of your change.", size=16),
                        sans("Outfit choices is might be complicated at the start but no worries AdvanceSelf got your back.", size=16),
                        ft.Text(
                            spans=[
                                ft.TextSpan("you can wear this kind of nut shells for guarantee: ", ft.TextStyle(font_family="Inria Serif", color=TEXT_DARK, size=16)),
                                ft.TextSpan("[cuts]", ft.TextStyle(font_family="Inria Serif", color=TEXT_RED, size=16)),
                            ],
                            text_align=ft.TextAlign.CENTER
                        ),
                        sans("And for the color palette you can wear clothes preferably this color(s):\n(you can combine the color with your free will)", size=16),
                        
                        # Color palette placeholder
                        ft.Row(alignment=ft.MainAxisAlignment.CENTER, spacing=6, controls=[
                            sans("colors will show up at here in squares like", size=16),
                            ft.Container(width=16, height=16, bgcolor="red"),
                            ft.Container(width=16, height=16, bgcolor="green"),
                            ft.Container(width=16, height=16, bgcolor="blue"),
                            ft.Container(width=16, height=16, bgcolor="purple"),
                            sans("but not that small it is going to BIG", size=16),
                        ]),
                        
                        sans("If you're having trouble at the combine choice here the other people in your style dressed like this:", size=16),
                        ft.Container(height=10),
                        card_row()
                    ]
                ),

                # Accessories Section
                ft.Column(
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                    spacing=30,
                    controls=[
                        serif("Little Deatils with Accesoires", size=32),
                        sans("You don't have to but why wont you?", size=16),
                        sans("For some styles it is important to have accesoires.\nIt is adding a different athmosphere isn't it?", size=16),
                        sans("Here some accesoires for your style:", size=16),
                        ft.Container(height=10),
                        card_row()
                    ]
                ),
            ]
        )
    )

    page.add(header, body, footer)
    
if __name__ == "__main__":
    ft.run(main)