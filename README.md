# GraphZen Chart Maker

A modern, responsive chart creation application built with Next.js. Create beautiful, interactive charts from your data with an intuitive interface and professional styling.

## Features

- **Multiple Chart Types**: Horizontal bar, vertical bar, pie, and donut charts
- **Interactive Design**: Real-time chart preview with hover effects and tooltips
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Professional Styling**: Clean, modern interface with dark theme
- **Data Management**: Easy data input and editing
- **Export Options**: Multiple export formats for charts
- **Customization**: Title, subtitle, colors, and formatting options

## Technology Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Runtime**: React 19 with TypeScript 5
- **Styling**: Tailwind CSS 3.4 with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Testing**: Vitest with Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd chart-maker
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Alternative Port

To run on port 8080:
```bash
npm run dev:8080
```

## Usage

1. **Select Chart Type**: Choose from horizontal bar, vertical bar, pie, or donut charts
2. **Add Data**: Input your data points with labels and values
3. **Customize**: Set titles, subtitles, colors, and formatting options
4. **Preview**: View your chart in real-time with interactive features
5. **Export**: Download your chart in various formats

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run dev:8080` - Start development server on port 8080
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript compiler check
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage report
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
├── app/                    # Next.js app router pages
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── layouts/          # Layout components
│   └── chart-preview.tsx # Main chart rendering component
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── styles/               # Global styles and CSS utilities
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## Key Components

- **ChartPreview**: Main chart rendering and interaction logic
- **Layout Components**: Responsive layout management
- **UI Components**: Form controls, buttons, dialogs
- **Hooks**: Custom hooks for chart utilities and responsive behavior

## Development Notes

- The app uses a responsive layout system with three zones (navigation, controls, preview)
- Chart animations and interactions are handled with CSS keyframes and React state
- The design system uses HSL color variables for consistent theming
- Mobile-first responsive design with container queries

## Contributing

1. Follow the existing code style and patterns
2. Run tests before submitting changes
3. Update documentation for new features
4. Use conventional commit messages

## License

[Specify your license here]

---

Built with ❤️ using modern web technologies