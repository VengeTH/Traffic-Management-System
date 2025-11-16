/**
 * Script to generate grid background pattern as PNG image
 * This creates a tileable PNG image of the grid pattern
 */

const fs = require("fs");
const path = require("path");

// * Configuration
const GRID_SIZE = 28; // Grid cell size in pixels
const COLOR = "#86efac"; // Light green color (very visible)
const OPACITY = 0.3; // 30% opacity (highly visible)
const OUTPUT_SIZE = 560; // Output image size (20x20 grid cells - larger for better quality)
const OUTPUT_PATH = path.join(__dirname, "../frontend/public/grid-background.png");

// * Calculate RGBA color
function hexToRgba(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// * Generate PNG using canvas
function generateGridPNG() {
  try {
    // Try to use node-canvas if available
    let Canvas;
    try {
      Canvas = require("canvas");
    } catch (error) {
      console.error("Error: 'canvas' package is not installed.");
      console.error("Please install it by running: npm install canvas");
      console.error("\nAlternatively, you can use an online SVG to PNG converter");
      console.error("or use the SVG file directly in your CSS.");
      process.exit(1);
    }

    const { createCanvas } = Canvas;
    const canvas = createCanvas(OUTPUT_SIZE, OUTPUT_SIZE);
    const ctx = canvas.getContext("2d");

    // * Fill with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    // * Set line style - make lines more visible
    ctx.strokeStyle = hexToRgba(COLOR, OPACITY);
    ctx.lineWidth = 1;
    ctx.lineCap = "square";

    // * Draw vertical lines
    for (let x = 0; x <= OUTPUT_SIZE; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, OUTPUT_SIZE);
      ctx.stroke();
    }

    // * Draw horizontal lines
    for (let y = 0; y <= OUTPUT_SIZE; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(OUTPUT_SIZE, y);
      ctx.stroke();
    }

    // * Save as PNG
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(OUTPUT_PATH, buffer);

    console.log(`✅ Grid background PNG generated successfully!`);
    console.log(`📁 Location: ${OUTPUT_PATH}`);
    console.log(`📐 Size: ${OUTPUT_SIZE}x${OUTPUT_SIZE}px`);
    console.log(`🎨 Grid: ${GRID_SIZE}x${GRID_SIZE}px cells`);
  } catch (error) {
    console.error("Error generating PNG:", error.message);
    process.exit(1);
  }
}

// * Run the script
generateGridPNG();

