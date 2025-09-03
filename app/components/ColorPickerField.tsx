import { useState, useCallback } from "react";
import { ColorPicker, TextField, BlockStack, InlineStack, Text, Box, Popover, Button } from "@shopify/polaris";

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

// Helper functions for color conversion
function hexToHsb(hex: string): { hue: number; saturation: number; brightness: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  const saturation = max === 0 ? 0 : delta / max;
  const brightness = max;

  return {
    hue: hue,
    saturation: Math.round(saturation * 100) / 100,
    brightness: Math.round(brightness * 100) / 100,
  };
}

function hsbToHex(hsb: { hue: number; saturation: number; brightness: number }): string {
  const h = hsb.hue / 360;
  const s = hsb.saturation;
  const v = hsb.brightness;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r, g, b;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: r = g = b = 0;
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function ColorPickerField({ label, value, onChange }: ColorPickerFieldProps) {
  const [hexInput, setHexInput] = useState(value);
  const [hsbColor, setHsbColor] = useState(hexToHsb(value));
  const [popoverActive, setPopoverActive] = useState(false);

  const handleColorPickerChange = useCallback((color: { hue: number; saturation: number; brightness: number }) => {
    setHsbColor(color);
    const hexValue = hsbToHex(color);
    setHexInput(hexValue);
    onChange(hexValue);
  }, [onChange]);

  const handleHexInputChange = useCallback((inputValue: string) => {
    setHexInput(inputValue);
    
    // Validate hex format
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (hexRegex.test(inputValue)) {
      const hsbValue = hexToHsb(inputValue);
      setHsbColor(hsbValue);
      onChange(inputValue);
    }
  }, [onChange]);

  const togglePopover = useCallback(() => {
    setPopoverActive(!popoverActive);
  }, [popoverActive]);

  const colorButton = (
    <Button
      onClick={togglePopover}
      size="large"
      variant="plain"
      removeUnderline
    >
      <div
        style={{
          width: "40px",
          height: "32px",
          backgroundColor: hexInput,
          border: "1px solid #ddd",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      />
    </Button>
  );

  return (
    <BlockStack gap="200">
      <Text as="p" variant="bodyMd">
        {label}
      </Text>
      
      <InlineStack gap="300" align="center">
        <Popover
          active={popoverActive}
          activator={colorButton}
          onClose={togglePopover}
          ariaHaspopup={false}
          sectioned
        >
          <Box padding="400">
            <BlockStack gap="300">
              <ColorPicker
                onChange={handleColorPickerChange}
                color={hsbColor}
              />
              <TextField
                label=""
                value={hexInput}
                onChange={handleHexInputChange}
                prefix="#"
                placeholder="FFFFFF"
                maxLength={7}
                autoComplete="off"
              />
            </BlockStack>
          </Box>
        </Popover>
        
        <div style={{ minWidth: "200px" }}>
          <TextField
            label=""
            value={hexInput}
            onChange={handleHexInputChange}
            prefix="#"
            placeholder="FFFFFF"
            maxLength={7}
            autoComplete="off"
          />
        </div>
      </InlineStack>
    </BlockStack>
  );
}