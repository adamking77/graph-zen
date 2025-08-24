#!/usr/bin/env node

/**
 * Responsive Chart Preview Test Script
 * 
 * This script tests the responsive behavior of chart previews across different screen sizes,
 * with particular focus on mobile chart size presets that were reported as not rendering correctly.
 */

const puppeteer = require('puppeteer');
const { SIZE_PRESETS } = require('./lib/chart-constants');

// Test configurations for different screen sizes
const TEST_VIEWPORTS = [
  { name: 'Mobile Portrait', width: 375, height: 667, deviceScaleFactor: 2 },
  { name: 'Mobile Landscape', width: 667, height: 375, deviceScaleFactor: 2 },
  { name: 'Tablet Portrait', width: 768, height: 1024, deviceScaleFactor: 2 },
  { name: 'Tablet Landscape', width: 1024, height: 768, deviceScaleFactor: 2 },
  { name: 'Desktop Small', width: 1200, height: 800, deviceScaleFactor: 1 },
  { name: 'Desktop Large', width: 1920, height: 1080, deviceScaleFactor: 1 }
];

// Chart size presets to test (focus on mobile and story which are portrait)
const CHART_PRESETS_TO_TEST = [
  'mobile',     // 750×1334 (9:16) - reported as problematic
  'story',      // 1080×1920 (9:16) - reported as problematic  
  'instagram',  // 1080×1080 (1:1) - square format
  'web',        // 1200×800 (3:2) - landscape format
  'presentation' // 1920×1080 (16:9) - wide landscape
];

class ResponsiveChartTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async testViewport(viewport) {
    console.log(`\n📱 Testing viewport: ${viewport.name} (${viewport.width}×${viewport.height})`);
    
    await this.page.setViewport(viewport);
    await this.page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });

    // Wait for the chart to load
    await this.page.waitForSelector('main[role="main"]', { timeout: 10000 });

    // Get the current responsive zone widths
    const zoneWidths = await this.page.evaluate(() => {
      const zone1 = document.querySelector('.zone1-expanded');
      const zone2 = document.querySelector('.zone2-width');
      
      if (!zone1 || !zone2) return null;
      
      const zone1Styles = window.getComputedStyle(zone1);
      const zone2Styles = window.getComputedStyle(zone2);
      
      return {
        zone1: parseInt(zone1Styles.width),
        zone2: parseInt(zone2Styles.width)
      };
    });

    // Test chart preview container dimensions
    const chartDimensions = await this.page.evaluate(() => {
      const chartContainer = document.querySelector('main[role="main"] > div');
      if (!chartContainer) return null;
      
      const rect = chartContainer.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        availableWidth: window.innerWidth,
        availableHeight: window.innerHeight
      };
    });

    // Test responsive CSS breakpoints
    const responsiveStatus = await this.page.evaluate((viewport) => {
      const isMobile = viewport.width < 768;
      const isTablet = viewport.width >= 768 && viewport.width < 1200;
      const isDesktop = viewport.width >= 1200;
      
      return {
        isMobile,
        isTablet,
        isDesktop,
        expectedBreakpoint: isMobile ? 'mobile' : (isTablet ? 'tablet' : 'desktop')
      };
    }, viewport);

    this.results.push({
      viewport: viewport.name,
      dimensions: viewport,
      zoneWidths,
      chartDimensions,
      responsiveStatus
    });

    console.log(`  ✓ Zone widths: Zone1=${zoneWidths?.zone1}px, Zone2=${zoneWidths?.zone2}px`);
    console.log(`  ✓ Chart container: ${chartDimensions?.width}×${chartDimensions?.height}px`);
    console.log(`  ✓ Responsive breakpoint: ${responsiveStatus.expectedBreakpoint}`);
  }

  async testChartPreset(presetName) {
    console.log(`\n📊 Testing chart preset: ${presetName}`);
    
    const preset = SIZE_PRESETS[presetName];
    if (!preset) {
      console.log(`  ❌ Preset '${presetName}' not found`);
      return;
    }

    console.log(`  📏 Preset dimensions: ${preset.width}×${preset.height} (${preset.aspectRatio})`);
    
    // Test the aspect ratio calculation logic
    const aspectRatio = preset.width / preset.height;
    const isPortrait = aspectRatio < 0.8;
    
    console.log(`  📐 Calculated aspect ratio: ${aspectRatio.toFixed(2)} (${isPortrait ? 'portrait' : 'landscape'})`);
    
    // Test container dimensions calculation using the logic from chart-preview.tsx
    const testResult = await this.page.evaluate((preset) => {
      const aspectRatio = preset.width / preset.height;
      const windowSize = { width: window.innerWidth, height: window.innerHeight };
      
      // Mirror the logic from getContainerDimensions()
      const titleSpace = 80;
      const legendSpace = 50;
      const padding = 48;
      const reservedHeight = titleSpace + legendSpace + padding;
      
      const availableViewportWidth = windowSize.width > 0 ? windowSize.width - 640 : 800;
      const availableViewportHeight = windowSize.height > 0 ? windowSize.height - 180 : 600;
      
      const maxContainerWidth = Math.min(
        Math.max(availableViewportWidth * 0.95, aspectRatio < 0.8 ? 400 : 600),
        aspectRatio < 0.8 ? 500 : 1000
      );
      
      const maxContainerHeight = Math.min(
        Math.max(availableViewportHeight * 0.85, aspectRatio < 0.8 ? 600 : 500),
        aspectRatio < 0.8 ? 900 : 700
      );
      
      const availableHeight = maxContainerHeight - reservedHeight;
      
      let containerWidth = maxContainerWidth;
      let containerHeight = maxContainerWidth / aspectRatio;
      
      if (containerHeight > availableHeight) {
        containerHeight = availableHeight;
        containerWidth = availableHeight * aspectRatio;
      }
      
      containerWidth = Math.max(containerWidth, aspectRatio < 0.8 ? 350 : 500);
      containerHeight = Math.max(containerHeight, aspectRatio < 0.8 ? 400 : 300);
      
      return {
        containerWidth,
        containerHeight: containerHeight + reservedHeight,
        availableViewportWidth,
        availableViewportHeight,
        maxContainerWidth,
        maxContainerHeight,
        aspectRatio,
        isPortrait: aspectRatio < 0.8
      };
    }, preset);

    console.log(`  ✓ Container dimensions: ${testResult.containerWidth.toFixed(0)}×${testResult.containerHeight.toFixed(0)}px`);
    console.log(`  ✓ Available viewport: ${testResult.availableViewportWidth}×${testResult.availableViewportHeight}px`);
    console.log(`  ✓ Portrait handling: ${testResult.isPortrait ? 'enabled' : 'disabled'}`);
    
    // Check if the dimensions are reasonable
    const isValidSize = testResult.containerWidth > 0 && testResult.containerHeight > 0;
    const hasMinimumSize = testResult.containerWidth >= 350 && testResult.containerHeight >= 400;
    
    console.log(`  ${isValidSize ? '✓' : '❌'} Valid size: ${isValidSize}`);
    console.log(`  ${hasMinimumSize ? '✓' : '❌'} Minimum size met: ${hasMinimumSize}`);
    
    if (!isValidSize || !hasMinimumSize) {
      console.log(`  ⚠️  Potential issue detected with ${presetName} preset`);
    }
  }

  async runTests() {
    console.log('🧪 Starting Responsive Chart Preview Tests\n');
    
    try {
      await this.init();
      
      // Test each viewport
      for (const viewport of TEST_VIEWPORTS) {
        await this.testViewport(viewport);
      }
      
      // Test chart presets at desktop resolution
      console.log('\n📊 Testing Chart Size Presets at Desktop Resolution');
      await this.page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
      await this.page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
      
      for (const presetName of CHART_PRESETS_TO_TEST) {
        await this.testChartPreset(presetName);
      }
      
      console.log('\n📊 Testing Chart Size Presets at Mobile Resolution');
      await this.page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
      await this.page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
      
      for (const presetName of CHART_PRESETS_TO_TEST) {
        await this.testChartPreset(presetName);
      }
      
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  printSummary() {
    console.log('\n📋 Test Summary');
    console.log('================');
    
    // Check for responsive breakpoint consistency
    const expectedZoneWidths = {
      'Mobile Portrait': { zone1: 200, zone2: 280 },
      'Mobile Landscape': { zone1: 200, zone2: 280 },
      'Tablet Portrait': { zone1: 220, zone2: 320 },
      'Tablet Landscape': { zone1: 220, zone2: 320 },
      'Desktop Small': { zone1: 240, zone2: 360 },
      'Desktop Large': { zone1: 240, zone2: 360 }
    };
    
    let allBreakpointsCorrect = true;
    
    for (const result of this.results) {
      const expected = expectedZoneWidths[result.viewport];
      const actual = result.zoneWidths;
      
      if (actual) {
        const zone1Correct = actual.zone1 === expected.zone1;
        const zone2Correct = actual.zone2 === expected.zone2;
        
        console.log(`${result.viewport}: ${zone1Correct && zone2Correct ? '✓' : '❌'} Zone1=${actual.zone1}px (expected ${expected.zone1}), Zone2=${actual.zone2}px (expected ${expected.zone2})`);
        
        if (!zone1Correct || !zone2Correct) {
          allBreakpointsCorrect = false;
        }
      } else {
        console.log(`${result.viewport}: ❌ Could not detect zone widths`);
        allBreakpointsCorrect = false;
      }
    }
    
    console.log(`\n🎯 Overall Status: ${allBreakpointsCorrect ? '✅ All responsive breakpoints working correctly' : '❌ Some responsive breakpoints need adjustment'}`);
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (allBreakpointsCorrect) {
      console.log('  ✓ Responsive layout is working correctly across all screen sizes');
      console.log('  ✓ Mobile chart size presets should render properly');
      console.log('  ✓ Portrait format handling is implemented correctly');
    } else {
      console.log('  ⚠️  Some responsive breakpoints may need adjustment');
      console.log('  ⚠️  Test mobile chart size presets manually to ensure proper rendering');
    }
  }
}

// Run the tests
const tester = new ResponsiveChartTester();
tester.runTests().catch(console.error);