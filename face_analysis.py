"""
Yüz Analiz Modülü - MediaPipe Face Mesh
Debug modu: console üzerinden çalışır

Hesaplanan Ölçümler:
1. Kaş Kavis
2. Göz Yüksekliği ile Kaş Mesafesi
3. Burun En/Boy Oranı
4. Burun Genişliği / Ağız Genişliği
5. Burun - Dudak - Çene
6. Üst Dudak / Alt Dudak
7. Yüz Yatay Oranı
8. Yüz Dikey Oranı
9. Yüz En/Boy Oranı
10. Göz En/Boy Oranı
11. Kaş Pozisyonu
"""

import cv2
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
import numpy as np
import os
import math

PHI = 1.618034  # Altın Oran (φ)

# Yeni Tasks API için model dosyası yolu
_MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "face_landmarker.task")


# ─────────────────────────────────────────────
#  Yardımcı Fonksiyonlar
# ─────────────────────────────────────────────

def get_landmark(landmarks, idx, img_w, img_h):
    """Landmark'ı piksel koordinatına çevirir."""
    lm = landmarks[idx]
    return np.array([lm.x * img_w, lm.y * img_h])


def euclidean(p1, p2):
    """İki nokta arası Öklid mesafesi."""
    return float(np.linalg.norm(p1 - p2))


def midpoint(p1, p2):
    """İki noktanın orta noktası."""
    return (p1 + p2) / 2.0


def polyline_length(points):
    """Nokta dizisinin toplam uzunluğu (kavis hesabı için)."""
    total = 0.0
    for i in range(len(points) - 1):
        total += euclidean(points[i], points[i + 1])
    return total


# ─────────────────────────────────────────────
#  MediaPipe Face Mesh Landmark İndeksleri
#  (468 noktalı model)
# ─────────────────────────────────────────────

# Yüz dış sınırı (sol – sağ – üst – alt)
FACE_LEFT   = 234   # sol şakak
FACE_RIGHT  = 454   # sağ şakak
FACE_TOP    = 10    # alın üstü
FACE_BOTTOM = 152   # çene ucu

# Sol kaş (iç→dış sırası: burun tarafı → şakak tarafı)
LEFT_EYEBROW  = [336, 296, 334, 293, 300, 285, 295, 282, 283, 276]
# Sağ kaş (iç→dış sırası)
RIGHT_EYEBROW = [107,  66, 105,  63,  70,  55,  65,  52,  53,  46]

# Sol göz
LEFT_EYE_LEFT   = 362   # sol köşe
LEFT_EYE_RIGHT  = 263   # sağ köşe
LEFT_EYE_TOP    = 386   # üst
LEFT_EYE_BOTTOM = 374   # alt

# Sağ göz
RIGHT_EYE_LEFT   = 133  # sol köşe
RIGHT_EYE_RIGHT  = 33   # sağ köşe
RIGHT_EYE_TOP    = 159  # üst
RIGHT_EYE_BOTTOM = 145  # alt

# Burun
NOSE_TIP    = 4    # burun ucu
NOSE_LEFT   = 129  # burun sol kanat
NOSE_RIGHT  = 358  # burun sağ kanat
NOSE_BRIDGE = 168  # burun köprüsü ortası (gözler arası çukur, LM168)

# Ağız / Dudak
MOUTH_LEFT   = 61   # ağız sol köşe
MOUTH_RIGHT  = 291  # ağız sağ köşe
UPPER_LIP_TOP    = 13   # üst dudak merkez üstü
UPPER_LIP_BOTTOM = 14   # üst dudak merkez altı  (= alt dudak üstü)
LOWER_LIP_TOP    = 14   # üst dudak ile alt dudak arası
LOWER_LIP_BOTTOM = 17   # alt dudak alt noktası

# Çene
CHIN = 152


# ─────────────────────────────────────────────
#  Hesaplama Fonksiyonları
# ─────────────────────────────────────────────

def kas_kavis(lms, img_w, img_h):
    """
    Kaş Kavis:
    Kaşın gerçek (polyline) uzunluğu / iki uç nokta arası düz mesafe
    1.0'a ne kadar yakınsa o kadar düz, büyük değer = daha kavisli
    """
    results = {}
    for side, indices in [("Sol Kaş", LEFT_EYEBROW), ("Sağ Kaş", RIGHT_EYEBROW)]:
        pts = [get_landmark(lms, i, img_w, img_h) for i in indices]
        arc   = polyline_length(pts)
        chord = euclidean(pts[0], pts[-1])
        ratio = arc / chord if chord > 0 else 0
        results[side] = round(ratio, 4)
    return results


def goz_yuksekligi_kas_mesafesi(lms, img_w, img_h):
    """
    Göz Yüksekliği ile Kaş Mesafesi:
    Kaşın en alt noktası ile gözün üst kapağı arası mesafe (normalize: göz genişliğine)
    """
    results = {}

    # Sol
    left_brow_bottom = get_landmark(lms, LEFT_EYEBROW[0], img_w, img_h)
    for i in LEFT_EYEBROW:
        pt = get_landmark(lms, i, img_w, img_h)
        if pt[1] > left_brow_bottom[1]:
            left_brow_bottom = pt
    left_eye_top    = get_landmark(lms, LEFT_EYE_TOP, img_w, img_h)
    left_eye_left   = get_landmark(lms, LEFT_EYE_LEFT, img_w, img_h)
    left_eye_right  = get_landmark(lms, LEFT_EYE_RIGHT, img_w, img_h)
    left_eye_width  = euclidean(left_eye_left, left_eye_right)
    left_gap        = abs(left_eye_top[1] - left_brow_bottom[1])
    results["Sol (px)"]        = round(left_gap, 2)
    results["Sol (normalize)"] = round(left_gap / left_eye_width, 4) if left_eye_width > 0 else 0

    # Sağ
    right_brow_bottom = get_landmark(lms, RIGHT_EYEBROW[0], img_w, img_h)
    for i in RIGHT_EYEBROW:
        pt = get_landmark(lms, i, img_w, img_h)
        if pt[1] > right_brow_bottom[1]:
            right_brow_bottom = pt
    right_eye_top   = get_landmark(lms, RIGHT_EYE_TOP, img_w, img_h)
    right_eye_left  = get_landmark(lms, RIGHT_EYE_LEFT, img_w, img_h)
    right_eye_right = get_landmark(lms, RIGHT_EYE_RIGHT, img_w, img_h)
    right_eye_width = euclidean(right_eye_left, right_eye_right)
    right_gap       = abs(right_eye_top[1] - right_brow_bottom[1])
    results["Sağ (px)"]        = round(right_gap, 2)
    results["Sağ (normalize)"] = round(right_gap / right_eye_width, 4) if right_eye_width > 0 else 0

    return results


def burun_en_boy_orani(lms, img_w, img_h):
    """
    Burun En/Boy Oranı:
    Burun genişliği (sol kanat – sağ kanat) / Burun yüksekliği (köprü – uç)
    """
    nose_left   = get_landmark(lms, NOSE_LEFT,   img_w, img_h)
    nose_right  = get_landmark(lms, NOSE_RIGHT,  img_w, img_h)
    nose_tip    = get_landmark(lms, NOSE_TIP,    img_w, img_h)
    nose_bridge = get_landmark(lms, NOSE_BRIDGE, img_w, img_h)

    width  = euclidean(nose_left, nose_right)
    height = euclidean(nose_bridge, nose_tip)
    ratio  = width / height if height > 0 else 0

    return {
        "Burun Genişliği (px)": round(width, 2),
        "Burun Yüksekliği (px)": round(height, 2),
        "En/Boy Oranı": round(ratio, 4),
    }


def burun_genisligi_agiz_genisligi(lms, img_w, img_h):
    """
    Burun Genişliği / Ağız Genişliği:
    İdeal oran genellikle ~0.75–0.80 arası kabul edilir
    """
    nose_left   = get_landmark(lms, NOSE_LEFT,    img_w, img_h)
    nose_right  = get_landmark(lms, NOSE_RIGHT,   img_w, img_h)
    mouth_left  = get_landmark(lms, MOUTH_LEFT,   img_w, img_h)
    mouth_right = get_landmark(lms, MOUTH_RIGHT,  img_w, img_h)

    nose_w  = euclidean(nose_left, nose_right)
    mouth_w = euclidean(mouth_left, mouth_right)
    ratio   = nose_w / mouth_w if mouth_w > 0 else 0

    return {
        "Burun Genişliği (px)": round(nose_w, 2),
        "Ağız Genişliği (px)":  round(mouth_w, 2),
        "Burun/Ağız Oranı":     round(ratio, 4),
    }


def burun_dudak_cene(lms, img_w, img_h):
    """
    Burun - Dudak - Çene (alt yüz üçlü mesafe oranı):
    Segment 1: Burun ucu → Üst dudak üstü
    Segment 2: Üst dudak üstü → Alt dudak altı
    Segment 3: Alt dudak altı → Çene ucu
    """
    nose_tip        = get_landmark(lms, NOSE_TIP,        img_w, img_h)
    upper_lip_top   = get_landmark(lms, UPPER_LIP_TOP,   img_w, img_h)
    lower_lip_bot   = get_landmark(lms, LOWER_LIP_BOTTOM,img_w, img_h)
    chin            = get_landmark(lms, CHIN,            img_w, img_h)

    seg1 = euclidean(nose_tip, upper_lip_top)
    seg2 = euclidean(upper_lip_top, lower_lip_bot)
    seg3 = euclidean(lower_lip_bot, chin)
    total = seg1 + seg2 + seg3

    return {
        "Burun→Üst Dudak (px)":  round(seg1, 2),
        "Dudak Kalınlığı (px)":  round(seg2, 2),
        "Alt Dudak→Çene (px)":   round(seg3, 2),
        "Seg1 Oranı":            round(seg1 / total, 4) if total > 0 else 0,
        "Seg2 Oranı":            round(seg2 / total, 4) if total > 0 else 0,
        "Seg3 Oranı":            round(seg3 / total, 4) if total > 0 else 0,
    }


def ust_dudak_alt_dudak(lms, img_w, img_h):
    """
    Üst Dudak / Alt Dudak Kalınlık Oranı:
    Üst dudak: UPPER_LIP_TOP → UPPER_LIP_BOTTOM (philtrum alt – dudak kapanma çizgisi)
    Alt dudak: LOWER_LIP_TOP → LOWER_LIP_BOTTOM
    """
    # LM 0  = üst dudağın Cupid yayı (en üst nokta)
    # LM 13 = üst dudağın iç üst kenarı
    # LM 14 = alt dudağın iç üst kenarı (dudak kapanma çizgisi)
    # LM 17 = alt dudağın en alt noktası
    upper_top = get_landmark(lms,  0, img_w, img_h)   # Cupid yayı
    upper_bot = get_landmark(lms, 13, img_w, img_h)   # üst dudağ iç üst
    lower_top = get_landmark(lms, 14, img_w, img_h)   # alt dudak iç üst
    lower_bot = get_landmark(lms, 17, img_w, img_h)   # alt dudak alt

    upper_h = abs(upper_top[1] - upper_bot[1])   # dikey mesafe
    lower_h = abs(lower_top[1] - lower_bot[1])   # dikey mesafe
    ratio   = upper_h / lower_h if lower_h > 0 else 0

    return {
        "Üst Dudak Yüksekliği (px)": round(upper_h, 2),
        "Alt Dudak Yüksekliği (px)": round(lower_h, 2),
        "Üst/Alt Oranı":             round(ratio, 4),
    }


def yuz_yatay_orani(lms, img_w, img_h):
    """
    Yüz Yatay Oranı (Golden Ratio testi):
    Yüz 5 eşit dilime bölünmeli:
    |sol kulak → sol göz sol| : |sol göz sol → sol göz sağ| :
    |sol göz sağ → sağ göz sol| : |sağ göz sol → sağ göz sağ| : |sağ göz sağ → sağ kulak|
    """
    face_l  = get_landmark(lms, FACE_LEFT,       img_w, img_h)
    face_r  = get_landmark(lms, FACE_RIGHT,      img_w, img_h)
    le_l    = get_landmark(lms, LEFT_EYE_LEFT,   img_w, img_h)
    le_r    = get_landmark(lms, LEFT_EYE_RIGHT,  img_w, img_h)
    re_l    = get_landmark(lms, RIGHT_EYE_LEFT,  img_w, img_h)
    re_r    = get_landmark(lms, RIGHT_EYE_RIGHT, img_w, img_h)

    total_x = abs(face_l[0] - face_r[0])  # sadece x ekseni, segmentlerle tutarlı
    s1 = abs(face_l[0] - le_l[0])
    s2 = abs(le_l[0]   - le_r[0])
    s3 = abs(le_r[0]   - re_l[0])
    s4 = abs(re_l[0]   - re_r[0])
    s5 = abs(re_r[0]   - face_r[0])

    return {
        "Sol Kulak → Sol Göz Sol (px)":  round(s1, 2),
        "Sol Göz Genişliği (px)":        round(s2, 2),
        "Göz Arası Mesafe (px)":         round(s3, 2),
        "Sağ Göz Genişliği (px)":        round(s4, 2),
        "Sağ Göz Sağ → Sağ Kulak (px)": round(s5, 2),
        "Toplam Yüz Genişliği (px)":     round(total_x, 2),
        "Oranlar (1:2:3:4:5)": (
            round(s1 / total_x, 3) if total_x else 0,
            round(s2 / total_x, 3) if total_x else 0,
            round(s3 / total_x, 3) if total_x else 0,
            round(s4 / total_x, 3) if total_x else 0,
            round(s5 / total_x, 3) if total_x else 0,
        ),
    }


def yuz_dikey_orani(lms, img_w, img_h):
    """
    Yüz Dikey Oranı (Üç bölge):
    Alın: FACE_TOP → sol kaş orta
    Orta: sol kaş orta → burun ucu
    Alt:  burun ucu → çene
    """
    face_top   = get_landmark(lms, FACE_TOP,  img_w, img_h)
    chin       = get_landmark(lms, CHIN,      img_w, img_h)
    nose_tip   = get_landmark(lms, NOSE_TIP,  img_w, img_h)

    # Kaş ortası (sol + sağ ortalaması)
    l_brow_mid = get_landmark(lms, LEFT_EYEBROW[len(LEFT_EYEBROW)//2],   img_w, img_h)
    r_brow_mid = get_landmark(lms, RIGHT_EYEBROW[len(RIGHT_EYEBROW)//2], img_w, img_h)
    brow_mid_y = (l_brow_mid[1] + r_brow_mid[1]) / 2

    zone1 = abs(brow_mid_y - face_top[1])
    zone2 = abs(nose_tip[1] - brow_mid_y)
    zone3 = abs(chin[1]     - nose_tip[1])
    total = zone1 + zone2 + zone3

    return {
        "Alın (px)":           round(zone1, 2),
        "Orta Yüz (px)":       round(zone2, 2),
        "Alt Yüz (px)":        round(zone3, 2),
        "Alın Oranı":          round(zone1 / total, 4) if total > 0 else 0,
        "Orta Yüz Oranı":      round(zone2 / total, 4) if total > 0 else 0,
        "Alt Yüz Oranı":       round(zone3 / total, 4) if total > 0 else 0,
    }


def yuz_en_boy_orani(lms, img_w, img_h):
    """
    Yüz En/Boy Oranı:
    Genişlik: sol şakak → sağ şakak
    Yükseklik: alın üstü → çene ucu
    """
    face_l  = get_landmark(lms, FACE_LEFT,   img_w, img_h)
    face_r  = get_landmark(lms, FACE_RIGHT,  img_w, img_h)
    face_t  = get_landmark(lms, FACE_TOP,    img_w, img_h)
    face_b  = get_landmark(lms, FACE_BOTTOM, img_w, img_h)

    width  = euclidean(face_l, face_r)
    height = euclidean(face_t, face_b)
    ratio  = width / height if height > 0 else 0

    return {
        "Yüz Genişliği (px)":  round(width, 2),
        "Yüz Yüksekliği (px)": round(height, 2),
        "En/Boy Oranı":        round(ratio, 4),
    }


def goz_en_boy_orani(lms, img_w, img_h):
    """
    Göz En/Boy Oranı:
    En: göz sol köşe → sağ köşe
    Boy: göz üstü → altı
    """
    results = {}
    for side, l_idx, r_idx, t_idx, b_idx in [
        ("Sol Göz", LEFT_EYE_LEFT,  LEFT_EYE_RIGHT,  LEFT_EYE_TOP,  LEFT_EYE_BOTTOM),
        ("Sağ Göz", RIGHT_EYE_LEFT, RIGHT_EYE_RIGHT, RIGHT_EYE_TOP, RIGHT_EYE_BOTTOM),
    ]:
        left   = get_landmark(lms, l_idx, img_w, img_h)
        right  = get_landmark(lms, r_idx, img_w, img_h)
        top    = get_landmark(lms, t_idx, img_w, img_h)
        bottom = get_landmark(lms, b_idx, img_w, img_h)

        width  = euclidean(left, right)
        height = euclidean(top, bottom)
        ratio  = width / height if height > 0 else 0

        results[side] = {
            "Genişlik (px)": round(width, 2),
            "Yükseklik (px)": round(height, 2),
            "En/Boy Oranı": round(ratio, 4),
        }
    return results


def kas_pozisyonu(lms, img_w, img_h):
    """
    Kaş Pozisyonu:
    Kaşın iç ucu ile göz iç köşesi arasındaki dikey mesafe (normalize: göz yüksekliği)
    + Kaşın eğimi (iç uç ile dış uç arasındaki açı)
    """
    results = {}

    for side, brow_inner, brow_outer, eye_inner, eye_top, eye_bot in [
        # Sol kas: LM listesi ic->dis sirasiyla, yani [0]=ic, [-1]=dis
        ("Sol Kaş",
         LEFT_EYEBROW[0],   LEFT_EYEBROW[-1],   # ic=336, dis=276
         LEFT_EYE_LEFT,     LEFT_EYE_TOP,       LEFT_EYE_BOTTOM),
        # Sag kas: [0]=ic, [-1]=dis
        ("Sağ Kaş",
         RIGHT_EYEBROW[0],  RIGHT_EYEBROW[-1],  # ic=107, dis=46
         RIGHT_EYE_RIGHT,   RIGHT_EYE_TOP,      RIGHT_EYE_BOTTOM),
    ]:
        b_inner = get_landmark(lms, brow_inner, img_w, img_h)
        b_outer = get_landmark(lms, brow_outer, img_w, img_h)
        e_inner = get_landmark(lms, eye_inner,  img_w, img_h)
        e_top   = get_landmark(lms, eye_top,    img_w, img_h)
        e_bot   = get_landmark(lms, eye_bot,    img_w, img_h)

        eye_h    = euclidean(e_top, e_bot)
        vert_gap = abs(b_inner[1] - e_inner[1])
        norm_gap = vert_gap / eye_h if eye_h > 0 else 0

        # Kas egim acisi: ic noktadan dis noktaya yon vektoru
        # Pozitif = dis uc yukari, negatif = dis uc asagi
        dx = b_outer[0] - b_inner[0]
        dy = b_outer[1] - b_inner[1]  # piksel y asagi artar
        # Goruntu koordinatinda yukari = kucuk y, egim hesabi: -dy kullan
        angle_deg = math.degrees(math.atan2(-dy, abs(dx)))

        results[side] = {
            "Dikey Mesafe (px)":   round(vert_gap, 2),
            "Normalize Mesafe":    round(norm_gap, 4),
            "Kaş Eğimi (derece)":  round(angle_deg, 2),
        }

    return results


# ─────────────────────────────────────────────
#  Puanlama Sistemi (Altın Oran Tabanlı)
# ─────────────────────────────────────────────

def _sg(value, ideal, tol=0.25):
    """Gaussian puan (0-100). tol: göreli sapma eşiği."""
    try:
        v, i = float(value), float(ideal)
    except (TypeError, ValueError):
        return 0.0
    if i == 0:
        return 0.0
    return max(0.0, 100.0 * math.exp(-((abs(v - i) / i / tol) ** 2)))


def _sym(a, b):
    """İki değerin simetri puanı (0-100)."""
    a, b = float(a), float(b)
    m = max(a, b)
    return max(0.0, (1.0 - abs(a - b) / m) * 100.0) if m else 0.0


def score_face(data: dict) -> dict:
    """
    Ham ölçüm dict'inden φ (altın oran) tabanlı kategori puanları üretir.
    Her kategori 0-100 arası puanlanır.
    """
    # ── KAŞ ──────────────────────────────────────────────────────
    kavis = data["Kaş Kavis"]
    # Hafif doğal yay: arc/chord ~1.10-1.20; geniş tolerans
    kavis_s  = (_sg(kavis["Sol Kaş"], 1.15, 0.20) + _sg(kavis["Sağ Kaş"], 1.15, 0.20)) / 2
    kavis_sym = _sym(kavis["Sol Kaş"], kavis["Sağ Kaş"])

    kgm = data["Göz Yüksekliği ile Kaş Mesafesi"]
    kgm_s = (_sg(kgm["Sol (normalize)"], 0.45, 0.40) + _sg(kgm["Sağ (normalize)"], 0.45, 0.40)) / 2

    kp = data["Kaş Pozisyonu"]
    kp_s = (_sg(kp["Sol Kaş"]["Normalize Mesafe"], 1.0, 0.35)
           + _sg(kp["Sağ Kaş"]["Normalize Mesafe"], 1.0, 0.35)) / 2

    kas_score = kavis_s * 0.25 + kavis_sym * 0.35 + kgm_s * 0.20 + kp_s * 0.20

    # ── GÖZ ──────────────────────────────────────────────────────
    # En/Boy ~3.0 (badem göz); φ²≈2.618 de kabul edilir
    goz = data["Göz En/Boy Oranı"]
    goz_ar = (_sg(goz["Sol Göz"]["En/Boy Oranı"], 3.0, 0.25)
             + _sg(goz["Sağ Göz"]["En/Boy Oranı"], 3.0, 0.25)) / 2
    goz_sym = _sym(goz["Sol Göz"]["En/Boy Oranı"], goz["Sağ Göz"]["En/Boy Oranı"])

    goz_score = goz_ar * 0.60 + goz_sym * 0.40

    # ── BURUN ─────────────────────────────────────────────────────
    # En/Boy: ideal 1/φ ≈ 0.618; Burun/Ağız: ideal 1/φ ≈ 0.618
    beb = data["Burun En/Boy Oranı"]
    bga = data["Burun Genişliği / Ağız Genişliği"]
    beb_s = _sg(beb["En/Boy Oranı"],       1 / PHI, 0.25)
    bga_s = _sg(bga["Burun/Ağız Oranı"],   1 / PHI, 0.25)

    burun_score = beb_s * 0.50 + bga_s * 0.50

    # ── DUDAK ─────────────────────────────────────────────────────
    # Üst/Alt oranı: ideal 1/φ ≈ 0.618 (alt dudak daha dolgun)
    dudak = data["Üst Dudak / Alt Dudak"]
    dudak_s = _sg(dudak["Üst/Alt Oranı"], 1 / PHI, 0.40)

    # Burun-dudak-çene üçüzlü oranı: ideal üçte bir bölünme
    bdc = data["Burun - Dudak - Çene"]
    bdc_s = (_sg(bdc["Seg1 Oranı"], 1/3, 0.20)
           + _sg(bdc["Seg2 Oranı"], 1/(3*PHI), 0.30)
           + _sg(bdc["Seg3 Oranı"], 1/3, 0.20)) / 3

    dudak_score = dudak_s * 0.45 + bdc_s * 0.55

    # ── ÇENE / YÜZ ───────────────────────────────────────────────
    # Yüz En/Boy: ideal 1/φ ≈ 0.618 (oval yüz)
    yuz_eb = data["Yüz En/Boy Oranı"]
    yuz_eb_s = _sg(yuz_eb["En/Boy Oranı"], 1 / PHI, 0.20)

    # Yüz dikey üç bölge: ideal eşit üçte bir
    yuz_dv = data["Yüz Dikey Oranı"]
    yuz_dv_s = (_sg(yuz_dv["Alın Oranı"],     1/3, 0.25)
              + _sg(yuz_dv["Orta Yüz Oranı"], 1/3, 0.25)
              + _sg(yuz_dv["Alt Yüz Oranı"],  1/3, 0.25)) / 3

    cene_score = yuz_eb_s * 0.50 + yuz_dv_s * 0.50

    # ── OVERALL ───────────────────────────────────────────────────
    # Yüz yatay 5'li oran: ideal her biri 0.20
    yuz_yat = data["Yüz Yatay Oranı"]
    oranlar = yuz_yat["Oranlar (1:2:3:4:5)"]
    yuz_yat_s = sum(_sg(float(o), 0.20, 0.35) for o in oranlar) / 5

    weights = {"Kaş": 0.18, "Göz": 0.22, "Burun": 0.20, "Dudak": 0.18, "Çene": 0.22}
    cat_scores = {
        "Kaş":   round(kas_score,   1),
        "Göz":   round(goz_score,   1),
        "Burun": round(burun_score, 1),
        "Dudak": round(dudak_score, 1),
        "Çene":  round(cene_score,  1),
    }
    overall = sum(cat_scores[k] * w for k, w in weights.items()) * 0.75 + yuz_yat_s * 0.25
    cat_scores["Overall"] = round(overall, 1)
    return cat_scores


# ─────────────────────────────────────────────
#  Ana Analiz Fonksiyonu
# ─────────────────────────────────────────────

def analyze_face(image_path: str) -> dict:
    """
    Verilen görüntü yolundaki yüzü analiz eder.
    Tüm ölçümleri içeren bir dict döner.
    MediaPipe Tasks API (0.10.x+) kullanır.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Dosya bulunamadı: {image_path}")

    if not os.path.exists(_MODEL_PATH):
        raise FileNotFoundError(
            f"Model dosyası bulunamadı: {_MODEL_PATH}\n"
            "Lütfen 'face_landmarker.task' dosyasını indirip proje klasörüne koyun."
        )

    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Görüntü okunamadı: {image_path}")

    img_h, img_w = image.shape[:2]
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Yeni Tasks API: FaceLandmarker
    base_options = mp_python.BaseOptions(model_asset_path=_MODEL_PATH)
    options = mp_vision.FaceLandmarkerOptions(
        base_options=base_options,
        running_mode=mp_vision.RunningMode.IMAGE,
        num_faces=1,
        min_face_detection_confidence=0.5,
        min_face_presence_confidence=0.5,
    )

    with mp_vision.FaceLandmarker.create_from_options(options) as landmarker:
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        detection_result = landmarker.detect(mp_image)

    if not detection_result.face_landmarks:
        raise RuntimeError("Yüz tespit edilemedi. Lütfen net bir yüz fotoğrafı kullanın.")

    lms = detection_result.face_landmarks[0]

    return {
        "Kaş Kavis":                     kas_kavis(lms, img_w, img_h),
        "Göz Yüksekliği ile Kaş Mesafesi": goz_yuksekligi_kas_mesafesi(lms, img_w, img_h),
        "Burun En/Boy Oranı":            burun_en_boy_orani(lms, img_w, img_h),
        "Burun Genişliği / Ağız Genişliği": burun_genisligi_agiz_genisligi(lms, img_w, img_h),
        "Burun - Dudak - Çene":          burun_dudak_cene(lms, img_w, img_h),
        "Üst Dudak / Alt Dudak":         ust_dudak_alt_dudak(lms, img_w, img_h),
        "Yüz Yatay Oranı":               yuz_yatay_orani(lms, img_w, img_h),
        "Yüz Dikey Oranı":               yuz_dikey_orani(lms, img_w, img_h),
        "Yüz En/Boy Oranı":              yuz_en_boy_orani(lms, img_w, img_h),
        "Göz En/Boy Oranı":              goz_en_boy_orani(lms, img_w, img_h),
        "Kaş Pozisyonu":                 kas_pozisyonu(lms, img_w, img_h),
    }


# ─────────────────────────────────────────────
#  Debug / Console Entrypoint
# ─────────────────────────────────────────────

def print_scores(scores: dict):
    """Puan tablosunu görsel bar grafiği ile yazdırır."""
    ICONS = {"Kaş": "🪮", "Göz": "👁️", "Burun": "👃", "Dudak": "💋", "Çene": "🫦", "Overall": "⭐"}
    BAR_W = 30
    print(f"\n{'╔' + '═'*55 + '╗'}")
    print(f"║{'  🏆  ALTIN ORAN PUANLAMA RAPORU (φ = 1.618)':^55}║")
    print(f"{'╠' + '═'*55 + '╣'}")
    for cat, score in scores.items():
        icon  = ICONS.get(cat, "📊")
        filled = int(round(score / 100 * BAR_W))
        bar   = "█" * filled + "░" * (BAR_W - filled)
        sep   = "  " if cat != "Overall" else "──"
        label = f"{icon} {cat}"
        print(f"║  {label:<14}{sep}{bar}  {score:>5.1f}/100  ║")
        if cat == "Çene":
            print(f"{'╠' + '═'*55 + '╣'}")
    print(f"{'╚' + '═'*55 + '╝'}")


def print_results(data: dict):
    """Sonuçları console'a güzel formatlı yazdırır."""
    SEP = "─" * 55

    for section, values in data.items():
        print(f"\n{'═' * 55}")
        print(f"  📐 {section}")
        print(SEP)

        if isinstance(values, dict):
            for key, val in values.items():
                print(f"   {key:<38}: {val}")
        else:
            print(f"   {values}")


def main():
    print("╔══════════════════════════════════════════════════════╗")
    print("║         Yüz Analiz Aracı  —  Debug Modu             ║")
    print("║         MediaPipe Face Mesh (468 Landmark)           ║")
    print("╚══════════════════════════════════════════════════════╝")

    while True:
        image_path = input("\n🖼️  Resim yolunu girin (çıkmak için 'q'): ").strip()

        if image_path.lower() in ("q", "quit", "exit"):
            print("Çıkılıyor...")
            break

        # Tırnak işaretlerini temizle (Windows explorer kopyala-yapıştır için)
        image_path = image_path.strip('"').strip("'")

        try:
            print("\n⏳ Analiz yapılıyor...\n")
            data = analyze_face(image_path)
            scores = score_face(data)
            print_scores(scores)
            print()
            show_raw = input("📋 Ham ölçümleri görmek ister misiniz? (e/h): ").strip().lower()
            if show_raw in ("e", "evet", "y", "yes"):
                print_results(data)
            print(f"\n{'═' * 55}")
            print("✅ Analiz tamamlandı.")

        except FileNotFoundError as e:
            print(f"\n❌ HATA: {e}")
        except ValueError as e:
            print(f"\n❌ HATA: {e}")
        except RuntimeError as e:
            print(f"\n⚠️  UYARI: {e}")
        except Exception as e:
            print(f"\n💥 Beklenmeyen hata: {type(e).__name__}: {e}")


if __name__ == "__main__":
    main()
