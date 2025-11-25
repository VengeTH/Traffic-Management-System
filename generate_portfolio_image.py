"""
Generate Portfolio Banner Image for E-VioPay
Creates a professional landscape banner image (1920x1080) for portfolio use
"""

from PIL import Image, ImageDraw, ImageFont
import math

# * Image dimensions (landscape)
WIDTH = 1920
HEIGHT = 1080

# * Color palette from design system
COLORS = {
    'primary_green': '#22c55e',
    'primary_green_dark': '#16a34a',
    'primary_green_light': '#4ade80',
    'primary_green_lighter': '#86efac',
    'primary_green_bg': '#f0fdf4',
    'secondary_blue': '#0ea5e9',
    'secondary_blue_dark': '#0284c7',
    'accent_orange': '#f59e0b',
    'white': '#ffffff',
    'gray_light': '#f3f4f6',
}

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_gradient_background(width, height, start_color, end_color):
    """Create a gradient background"""
    img = Image.new('RGB', (width, height))
    pixels = img.load()
    
    start_rgb = hex_to_rgb(start_color)
    end_rgb = hex_to_rgb(end_color)
    
    for y in range(height):
        ratio = y / height
        r = int(start_rgb[0] * (1 - ratio) + end_rgb[0] * ratio)
        g = int(start_rgb[1] * (1 - ratio) + end_rgb[1] * ratio)
        b = int(start_rgb[2] * (1 - ratio) + end_rgb[2] * ratio)
        
        for x in range(width):
            pixels[x, y] = (r, g, b)
    
    return img

def draw_abstract_traffic_flow(draw, width, height):
    """Draw abstract traffic flow lines"""
    # * Draw flowing curved lines suggesting traffic movement
    green = hex_to_rgb(COLORS['primary_green'])
    blue = hex_to_rgb(COLORS['secondary_blue'])
    
    # * Create flowing curves
    for i in range(5):
        y_start = height // 5 * (i + 1)
        points = []
        
        for x in range(0, width, 20):
            y = y_start + math.sin(x / 100 + i) * 30
            points.append((x, int(y)))
        
        # * Draw smooth curve
        if len(points) > 1:
            for j in range(len(points) - 1):
                color = green if i % 2 == 0 else blue
                opacity = 150 if i % 2 == 0 else 100
                draw.line([points[j], points[j+1]], fill=color + (opacity,), width=3)

def draw_geometric_patterns(draw, width, height):
    """Draw geometric patterns (grid, shapes)"""
    green_light = hex_to_rgb(COLORS['primary_green_lighter'])
    blue_light = hex_to_rgb(COLORS['secondary_blue'])
    
    # * Draw subtle grid pattern
    grid_spacing = 60
    for x in range(0, width, grid_spacing):
        draw.line([(x, 0), (x, height)], fill=green_light + (30,), width=1)
    for y in range(0, height, grid_spacing):
        draw.line([(0, y), (width, y)], fill=green_light + (30,), width=1)
    
    # * Draw geometric shapes (suggesting data cards)
    shapes = [
        {'x': width * 0.1, 'y': height * 0.2, 'w': 200, 'h': 150, 'color': blue_light},
        {'x': width * 0.7, 'y': height * 0.3, 'w': 180, 'h': 120, 'color': green_light},
        {'x': width * 0.85, 'y': height * 0.6, 'w': 150, 'h': 100, 'color': blue_light},
    ]
    
    for shape in shapes:
        # * Draw rounded rectangle (simulated with rectangle and circles)
        x, y, w, h = shape['x'], shape['y'], shape['w'], shape['h']
        color = shape['color'] + (40,)  # * Semi-transparent
        
        # * Draw main rectangle
        draw.rectangle([x, y, x + w, y + h], fill=color, outline=None)
        
        # * Add subtle border
        border_color = shape['color'] + (80,)
        draw.rectangle([x, y, x + w, y + h], outline=border_color, width=2)

def draw_qr_inspired_pattern(draw, width, height):
    """Draw QR code-inspired pattern in background"""
    green = hex_to_rgb(COLORS['primary_green'])
    blue = hex_to_rgb(COLORS['secondary_blue'])
    
    # * Create subtle QR-like pattern
    square_size = 40
    spacing = 60
    
    for y in range(0, height, spacing):
        for x in range(0, width, spacing):
            # * Randomly place squares (simulating QR pattern)
            if (x + y) % 3 == 0:
                color = green if (x + y) % 2 == 0 else blue
                opacity = 15  # * Very subtle
                draw.rectangle(
                    [x, y, x + square_size, y + square_size],
                    fill=color + (opacity,),
                    outline=None
                )

def create_portfolio_banner():
    """Create the main portfolio banner image"""
    # * Create base image with gradient background
    img = create_gradient_background(
        WIDTH, 
        HEIGHT, 
        COLORS['primary_green_bg'], 
        COLORS['white']
    )
    
    draw = ImageDraw.Draw(img, 'RGBA')
    
    # * Draw background patterns
    draw_qr_inspired_pattern(draw, WIDTH, HEIGHT)
    draw_geometric_patterns(draw, WIDTH, HEIGHT)
    draw_abstract_traffic_flow(draw, WIDTH, HEIGHT)
    
    # * Add overlay gradient for depth
    overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    
    # * Radial gradient effect
    center_x, center_y = WIDTH // 2, HEIGHT // 2
    max_radius = int(math.sqrt(WIDTH**2 + HEIGHT**2) / 2)
    
    for radius in range(max_radius, 0, -10):
        alpha = int(5 * (1 - radius / max_radius))
        overlay_draw.ellipse(
            [center_x - radius, center_y - radius, center_x + radius, center_y + radius],
            fill=(34, 197, 94, alpha),
            outline=None
        )
    
    # * Composite overlay
    img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    
    return img

def main():
    """Generate and save the portfolio banner image"""
    import sys
    import io
    
    # * Fix encoding for Windows console
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    
    print("Generating E-VioPay portfolio banner image...")
    
    # * Create the banner
    banner = create_portfolio_banner()
    
    # * Save as PNG (high quality)
    output_path = "portfolio_banner.png"
    banner.save(output_path, "PNG", optimize=True)
    print(f"Banner saved as: {output_path}")
    print(f"Dimensions: {WIDTH}x{HEIGHT}px")
    print(f"Format: PNG (RGB)")
    
    # * Also save as JPG (smaller file size)
    output_path_jpg = "portfolio_banner.jpg"
    banner.save(output_path_jpg, "JPEG", quality=90, optimize=True)
    print(f"Banner also saved as: {output_path_jpg} (smaller file size)")
    
    print("\nImage generation complete!")
    print("You can use either PNG (transparency support) or JPG (smaller size)")

if __name__ == "__main__":
    try:
        main()
    except ImportError:
        print("Error: PIL (Pillow) library not found.")
        print("Install it with: pip install Pillow")
        print("\nOr use the image generation prompts in IMAGE_GENERATION_PROMPT.md")
        print("with an AI image generator like DALL-E, Midjourney, or Canva AI.")

