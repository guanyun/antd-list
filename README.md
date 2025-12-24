# antd-list

Extracted List component from Ant Design UI version 6.

This package provides a clean wrapper around Antd's List component, preserving all functionality including `List.Item` and `List.Item.Meta` subcomponents.

## Installation

```bash
npm install antd-list antd react react-dom
# or
yarn add antd-list antd react react-dom
# or
pnpm add antd-list antd react react-dom
```

## Peer Dependencies

- `antd` ^6.0.0
- `react` ^18.0.0
- `react-dom` ^18.0.0

## Usage

```typescript
import List from 'antd-list';
import type { ListProps } from 'antd-list';

// Basic usage
<List
  dataSource={data}
  renderItem={(item) => (
    <List.Item>
      <List.Item.Meta
        title={item.title}
        description={item.description}
      />
    </List.Item>
  )}
/>

// With TypeScript generics
interface MyDataType {
  id: number;
  name: string;
}

<List<MyDataType>
  dataSource={myData}
  renderItem={(item) => (
    <List.Item key={item.id}>
      {item.name}
    </List.Item>
  )}
/>
```

## API

This package exports:

- `List` - The main List component (default export)
- `ListProps<T>` - TypeScript type for List props

The component supports all Antd List props and features:
- `List.Item` - List item subcomponent
- `List.Item.Meta` - List item meta subcomponent

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch mode for development
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

## License

MIT

