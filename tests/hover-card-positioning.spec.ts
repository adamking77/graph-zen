import { test, expect } from '@playwright/test';

test.describe('Hover Card Positioning', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('line chart hover cards should stay within screen bounds on rightmost points', async ({ page }) => {
    // Create a line chart with multiple data points
    await page.getByTestId('chart-type-line').click();
    
    // Add enough data points to fill the width
    for (let i = 0; i < 8; i++) {
      await page.getByRole('button', { name: 'Add Data Point' }).click();
    }
    
    // Get viewport width for boundary calculations
    const viewport = page.viewportSize();
    const screenWidth = viewport?.width || 1280;
    
    // Find all line chart data points (circles in SVG)
    const dataPoints = page.locator('svg circle[r="6"]');
    const pointCount = await dataPoints.count();
    
    // Test the rightmost data point (last one)
    if (pointCount > 0) {
      const rightmostPoint = dataPoints.nth(pointCount - 1);
      
      // Hover over the rightmost point
      await rightmostPoint.hover();
      
      // Wait for tooltip to appear
      const tooltip = page.locator('[class*="fixed"][class*="z-50"]');
      await expect(tooltip).toBeVisible();
      
      // Get tooltip position
      const tooltipBox = await tooltip.boundingBox();
      
      if (tooltipBox) {
        // Verify tooltip doesn't overflow screen width
        expect(tooltipBox.x + tooltipBox.width).toBeLessThanOrEqual(screenWidth);
        expect(tooltipBox.x).toBeGreaterThanOrEqual(0);
        
        // Log for debugging
        console.log(`Tooltip position: x=${tooltipBox.x}, width=${tooltipBox.width}, right edge=${tooltipBox.x + tooltipBox.width}, screen width=${screenWidth}`);
      }
    }
  });

  test('combo chart hover cards should stay within screen bounds on rightmost points', async ({ page }) => {
    // Create a combo chart
    await page.getByTestId('chart-type-combo').click();
    
    // Add enough data points to fill the width
    for (let i = 0; i < 8; i++) {
      await page.getByRole('button', { name: 'Add Data Point' }).click();
    }
    
    const viewport = page.viewportSize();
    const screenWidth = viewport?.width || 1280;
    
    // Test both bar and line elements in combo chart
    
    // Test rightmost bar element
    const bars = page.locator('svg rect[rx="2"]');
    const barCount = await bars.count();
    
    if (barCount > 0) {
      const rightmostBar = bars.nth(barCount - 1);
      
      await rightmostBar.hover();
      
      const tooltip = page.locator('[class*="fixed"][class*="z-50"]');
      await expect(tooltip).toBeVisible();
      
      const tooltipBox = await tooltip.boundingBox();
      
      if (tooltipBox) {
        expect(tooltipBox.x + tooltipBox.width).toBeLessThanOrEqual(screenWidth);
        expect(tooltipBox.x).toBeGreaterThanOrEqual(0);
      }
    }
    
    // Test rightmost line point
    const linePoints = page.locator('svg circle[r="5"]');
    const linePointCount = await linePoints.count();
    
    if (linePointCount > 0) {
      const rightmostLinePoint = linePoints.nth(linePointCount - 1);
      
      await rightmostLinePoint.hover();
      
      const tooltip = page.locator('[class*="fixed"][class*="z-50"]');
      await expect(tooltip).toBeVisible();
      
      const tooltipBox = await tooltip.boundingBox();
      
      if (tooltipBox) {
        expect(tooltipBox.x + tooltipBox.width).toBeLessThanOrEqual(screenWidth);
        expect(tooltipBox.x).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('tooltip positioning logic should prefer right side when space available', async ({ page }) => {
    // Create a line chart
    await page.getByTestId('chart-type-line').click();
    
    // Test a leftmost data point (should position tooltip to the right)
    const dataPoints = page.locator('svg circle[r="6"]');
    const pointCount = await dataPoints.count();
    
    if (pointCount > 0) {
      const leftmostPoint = dataPoints.nth(0);
      
      // Get the point's position
      const pointBox = await leftmostPoint.boundingBox();
      
      await leftmostPoint.hover();
      
      const tooltip = page.locator('[class*="fixed"][class*="z-50"]');
      await expect(tooltip).toBeVisible();
      
      const tooltipBox = await tooltip.boundingBox();
      
      if (pointBox && tooltipBox) {
        // For leftmost points with plenty of right space, tooltip should be positioned to the right
        expect(tooltipBox.x).toBeGreaterThan(pointBox.x + pointBox.width);
      }
    }
  });
});