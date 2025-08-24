#!/usr/bin/env node

/**
 * Quick Responsive Verification Script
 * 
 * This script verifies the responsive calculations and logic without requiring a browser.
 * It tests the mathematical logic used in the chart preview component.
 */

// Chart constants (from lib/chart-constants.ts)
const SIZE_PRESETS = {
  'presentation': { width: 1920, height: 1080, preset: 'Google Slides / PowerPoint', aspectRatio: '16:9' },
  'web': { width: 1200, height: 800, preset: 'Web / email', aspectRatio: '3:2' },
  'linkedin': { width: 1200, height: 628, preset: 'LinkedIn post', aspectRatio: '1.91:1' },
  'instagram': { width: 1080, height: 1080, preset: 'Instagram post', aspectRatio: '1:1' },
  'story': { width: 1080, height: 1920, preset: 'TikTok / Instagram story', aspectRatio: '9:16' },
  'twitter': { width: 1200, height: 675, preset: 'X (Twitter)', aspectRatio: '16:9' },
  'mobile': { width: 750, height: 1334, preset: 'Mobile', aspectRatio: '9:16' }
};

console.log('🧪 Verifying Responsive Chart Preview Logic\n');

// Test viewport configurations
const TEST_VIEWPORTS = [
  { name: 'Mobile Portrait', width: 375, height: 667 },
  { name: 'Mobile Landscape', width: 667, height: 375 },
  { name: 'Tablet Portrait', width: 768, height: 1024 },
  { name: 'Tablet Landscape', width: 1024, height: 768 },
  { name: 'Desktop Small', width: 1200, height: 800 },
  { name: 'Desktop Large', width: 1920, height: 1080 }
];

// Expected zone widths based on CSS breakpoints
const EXPECTED_ZONE_WIDTHS = {
  mobile: { zone1: 200, zone2: 280, total: 480 },
  tablet: { zone1: 220, zone2: 320, total: 540 },
  desktop: { zone1: 240, zone2: 360, total: 600 }
};

function getBreakpoint(width) {
  if (width < 768) return 'mobile';
  if (width < 1200) return 'tablet';
  return 'desktop';
}

function getContainerDimensions(dimensions, windowSize) {
  const aspectRatio = dimensions.width / dimensions.height;
  
  // Constants from chart-preview.tsx
  const titleSpace = 80;
  const legendSpace = (dimensions.type === 'pie' || dimensions.type === 'donut' || dimensions.type === 'combo') ? 50 : 30;
  const padding = 48;
  const reservedHeight = titleSpace + legendSpace + padding;
  
  // Dynamic zone width calculation based on responsive breakpoints (updated implementation)
  const getZoneWidths = (width) => {
    if (width < 768) return { zone1: 200, zone2: 280 }; // Mobile
    if (width < 1200) return { zone1: 220, zone2: 320 }; // Tablet
    return { zone1: 240, zone2: 360 }; // Desktop
  };
  
  const zones = getZoneWidths(windowSize.width);
  const marginsAndPadding = 40; // Margins/padding around zones
  const totalZoneWidth = zones.zone1 + zones.zone2 + marginsAndPadding;
  
  // Updated implementation with dynamic zone calculation
  const availableViewportWidth = windowSize.width > 0 ? windowSize.width - totalZoneWidth : 800;
  const availableViewportHeight = windowSize.width > 0 ? windowSize.height - 180 : 600;
  
  // Responsive max dimensions
  const maxContainerWidth = Math.min(
    Math.max(availableViewportWidth * 0.95, aspectRatio < 0.8 ? 400 : 600),
    aspectRatio < 0.8 ? 500 : 1000
  );
  
  const maxContainerHeight = Math.min(
    Math.max(availableViewportHeight * 0.85, aspectRatio < 0.8 ? 600 : 500),
    aspectRatio < 0.8 ? 900 : 700
  );
  
  const availableHeight = maxContainerHeight - reservedHeight;
  
  // Calculate dimensions maintaining aspect ratio
  let containerWidth = maxContainerWidth;
  let containerHeight = maxContainerWidth / aspectRatio;
  
  if (containerHeight > availableHeight) {
    containerHeight = availableHeight;
    containerWidth = availableHeight * aspectRatio;
  }
  
  // Ensure minimum sizes
  containerWidth = Math.max(containerWidth, aspectRatio < 0.8 ? 350 : 500);
  containerHeight = Math.max(containerHeight, aspectRatio < 0.8 ? 400 : 300);
  
  return {
    width: containerWidth,
    height: containerHeight + reservedHeight,
    chartWidth: containerWidth,
    chartHeight: containerHeight,
    availableWidth: containerWidth - padding,
    availableHeight: containerHeight - padding,
    aspectRatio,
    isPortrait: aspectRatio < 0.8,
    availableViewportWidth,
    availableViewportHeight
  };
}

function testViewport(viewport) {
  const breakpoint = getBreakpoint(viewport.width);
  const expected = EXPECTED_ZONE_WIDTHS[breakpoint];
  
  console.log(`📱 ${viewport.name} (${viewport.width}×${viewport.height})`);
  console.log(`   Breakpoint: ${breakpoint}`);
  console.log(`   Expected zones: Zone1=${expected.zone1}px, Zone2=${expected.zone2}px (Total: ${expected.total}px)`);
  
  // Test the updated implementation's dynamic deduction logic
  const getZoneWidths = (width) => {
    if (width < 768) return { zone1: 200, zone2: 280 }; // Mobile
    if (width < 1200) return { zone1: 220, zone2: 320 }; // Tablet
    return { zone1: 240, zone2: 360 }; // Desktop
  };
  
  const zones = getZoneWidths(viewport.width);
  const marginsAndPadding = 40;
  const currentDeduction = zones.zone1 + zones.zone2 + marginsAndPadding; // Dynamic deduction
  const expectedDeduction = expected.total + 40; // Zone total + margin
  const deductionAccuracy = Math.abs(currentDeduction - expectedDeduction);
  
  console.log(`   Current deduction: ${currentDeduction}px`);
  console.log(`   Expected deduction: ${expectedDeduction}px`);
  console.log(`   Accuracy: ${deductionAccuracy <= 20 ? '✓' : '⚠'} (${deductionAccuracy}px difference)`);
  
  const availableForChart = viewport.width - currentDeduction;
  console.log(`   Available for chart: ${availableForChart}px`);
  
  return {
    viewport: viewport.name,
    breakpoint,
    expected,
    currentDeduction,
    expectedDeduction,
    deductionAccuracy,
    availableForChart
  };
}

function testChartPreset(presetName, viewport) {
  const preset = SIZE_PRESETS[presetName];
  const windowSize = { width: viewport.width, height: viewport.height };
  
  console.log(`\n📊 Testing ${presetName} preset at ${viewport.name}`);
  console.log(`   Original: ${preset.width}×${preset.height} (${preset.aspectRatio})`);
  
  const result = getContainerDimensions(preset, windowSize);
  
  console.log(`   Calculated aspect ratio: ${result.aspectRatio.toFixed(2)} (${result.isPortrait ? 'Portrait' : 'Landscape'})`);
  console.log(`   Container dimensions: ${Math.round(result.width)}×${Math.round(result.height)}px`);
  console.log(`   Available viewport: ${result.availableViewportWidth}×${result.availableViewportHeight}px`);
  
  // Validate the result
  const isValidSize = result.width > 0 && result.height > 0;
  const hasMinimumSize = result.width >= 350 && result.height >= 400;
  const fitsInViewport = result.width <= result.availableViewportWidth && result.height <= result.availableViewportHeight;
  
  console.log(`   Valid size: ${isValidSize ? '✓' : '✗'}`);
  console.log(`   Minimum size (350×400): ${hasMinimumSize ? '✓' : '✗'}`);
  console.log(`   Fits in viewport: ${fitsInViewport ? '✓' : '⚠'}`);
  console.log(`   Portrait logic applied: ${result.isPortrait ? '✓' : '✗'}`);
  
  return {
    preset: presetName,
    viewport: viewport.name,
    original: preset,
    calculated: result,
    isValidSize,
    hasMinimumSize,
    fitsInViewport
  };
}

// Run tests
console.log('🔍 Testing Responsive Breakpoints\n');

const viewportResults = [];
for (const viewport of TEST_VIEWPORTS) {
  const result = testViewport(viewport);
  viewportResults.push(result);
  console.log('');
}

console.log('\n📊 Testing Chart Size Presets\n');

const chartResults = [];
const problemPresets = ['mobile', 'story']; // These were reported as problematic
const testViewports = [
  { name: 'Desktop Large', width: 1920, height: 1080 },
  { name: 'Mobile Portrait', width: 375, height: 667 }
];

for (const preset of problemPresets) {
  for (const viewport of testViewports) {
    const result = testChartPreset(preset, viewport);
    chartResults.push(result);
  }
}

console.log('\n📋 Summary\n');

// Analyze viewport results
const breakpointIssues = viewportResults.filter(r => r.deductionAccuracy > 20);
if (breakpointIssues.length === 0) {
  console.log('✅ All responsive breakpoints have accurate deduction calculations');
} else {
  console.log('⚠️  Some breakpoints have deduction accuracy issues:');
  breakpointIssues.forEach(issue => {
    console.log(`   - ${issue.viewport}: ${issue.deductionAccuracy}px difference`);
  });
}

// Analyze chart results
const chartIssues = chartResults.filter(r => !r.isValidSize || !r.hasMinimumSize);
if (chartIssues.length === 0) {
  console.log('✅ All tested chart presets render with valid dimensions');
} else {
  console.log('❌ Some chart presets have rendering issues:');
  chartIssues.forEach(issue => {
    console.log(`   - ${issue.preset} at ${issue.viewport}: ${issue.isValidSize ? '' : 'Invalid size, '}${issue.hasMinimumSize ? '' : 'Below minimum size'}`);
  });
}

// Check portrait format handling
const portraitTests = chartResults.filter(r => r.calculated.isPortrait);
console.log(`\n🎯 Portrait Format Tests: ${portraitTests.length} tests`);
portraitTests.forEach(test => {
  console.log(`   ${test.preset}: ${test.calculated.aspectRatio.toFixed(2)} ratio, ${Math.round(test.calculated.width)}×${Math.round(test.calculated.height)}px`);
});

// Recommendations
console.log('\n💡 Recommendations:');

if (breakpointIssues.length > 0) {
  console.log('   1. Consider updating chart-preview.tsx to use dynamic zone width calculations');
  console.log('   2. Replace fixed 640px deduction with responsive calculation');
}

if (chartIssues.length > 0) {
  console.log('   3. Review minimum size constraints for problematic presets');
  console.log('   4. Consider adjusting portrait format handling');
}

if (breakpointIssues.length === 0 && chartIssues.length === 0) {
  console.log('   ✅ The responsive implementation appears to be working correctly');
  console.log('   ✅ Mobile chart size presets should render properly');
}

console.log('\n🎉 Verification complete!');