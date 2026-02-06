# Custom Alert & Confirm System

A beautiful, modern alert and confirmation dialog system for your React application.

## Features

✨ **Beautiful Design**
- Glassmorphic backdrop with blur effects
- Smooth animations (slide-in, fade-in, zoom)
- Color-coded by type (success, error, warning, info)
- Auto-dismissing with progress bar
- Fully responsive

🎯 **Easy to Use**
- Simple hook-based API
- Promise-based confirm dialogs
- TypeScript support
- No dependencies except Lucide React icons

## Installation

The components are already installed in your project at:
- `src/components/ui/AlertProvider.tsx`
- `src/components/ui/ConfirmProvider.tsx`

They are already wrapped around your app in `App.tsx`.

## Usage

### 1. Alerts

```tsx
import { useAlert } from '@/components/ui';

function MyComponent() {
  const alert = useAlert();

  const handleSuccess = () => {
    alert.success('Success!', 'Your changes have been saved.');
  };

  const handleError = () => {
    alert.error('Error', 'Something went wrong.');
  };

  const handleWarning = () => {
    alert.warning('Warning', 'Please review your input.');
  };

  const handleInfo = () => {
    alert.info('Info', 'New features available!');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

### 2. Confirm Dialogs

```tsx
import { useConfirm } from '@/components/ui';
import { useAlert } from '@/components/ui';

function MyComponent() {
  const confirm = useConfirm();
  const alert = useAlert();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'Are you sure? This cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (confirmed) {
      // User clicked "Delete"
      await deleteItem();
      alert.success('Deleted', 'Item has been deleted.');
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

## API Reference

### useAlert()

Returns an object with the following methods:

#### `success(title, message?, duration?)`
- **title**: string - Alert title
- **message**: string (optional) - Alert message
- **duration**: number (optional) - Duration in ms (default: 5000)

#### `error(title, message?, duration?)`
Same parameters as `success()`

#### `warning(title, message?, duration?)`
Same parameters as `success()`

#### `info(title, message?, duration?)`
Same parameters as `success()`

#### `showAlert(type, title, message?, duration?)`
Generic method to show any type of alert
- **type**: 'success' | 'error' | 'warning' | 'info'

### useConfirm()

Returns an object with the following method:

#### `confirm(options): Promise<boolean>`

**Options:**
```typescript
{
  title: string;           // Dialog title
  message: string;         // Dialog message
  confirmText?: string;    // Confirm button text (default: 'Confirm')
  cancelText?: string;     // Cancel button text (default: 'Cancel')
  type?: 'danger' | 'warning' | 'info';  // Dialog type (default: 'warning')
}
```

**Returns:** Promise that resolves to `true` if confirmed, `false` if cancelled

## Examples

### Real-world Example: Delete Employee

```tsx
const deleteEmployee = async (employeeId: string) => {
  const confirmed = await confirm({
    title: 'Delete Employee',
    message: 'Are you sure you want to delete this employee? All data will be removed.',
    confirmText: 'Delete Employee',
    cancelText: 'Keep Employee',
    type: 'danger'
  });

  if (confirmed) {
    try {
      await api.delete(`/employees/${employeeId}`);
      alert.success('Employee Deleted', 'The employee has been removed.');
    } catch (error) {
      alert.error('Delete Failed', 'Failed to delete employee.');
    }
  }
};
```

### Real-world Example: Form Validation

```tsx
const saveForm = async (data: FormData) => {
  if (!data.email || !data.name) {
    alert.warning('Validation Error', 'Please fill in all required fields.');
    return;
  }

  try {
    await api.post('/save', data);
    alert.success('Saved!', 'Your changes have been saved.');
  } catch (error) {
    alert.error('Save Failed', 'An error occurred. Please try again.');
  }
};
```

### Real-world Example: Approve Action

```tsx
const approveWage = async (wageId: string) => {
  const confirmed = await confirm({
    title: 'Approve Wage',
    message: 'Once approved, this wage will be marked for payment. Continue?',
    confirmText: 'Approve',
    cancelText: 'Review Again',
    type: 'info'
  });

  if (confirmed) {
    try {
      await api.patch(`/wages/${wageId}/status`, { status: 'APPROVED' });
      alert.success('Wage Approved', 'The wage has been approved.');
    } catch (error) {
      alert.error('Approval Failed', 'Failed to approve wage.');
    }
  }
};
```

## Styling

The alerts use your existing color scheme:
- **Success**: Green (`green-400`, `green-500`)
- **Error**: Red (`red-400`, `red-500`)
- **Warning**: Amber (`amber-400`, `amber-500`)
- **Info**: Blue (`blue-400`, `blue-500`)

Background colors match your app's dark theme (`#0B0E14`, `#151A21`, `#1F2937`).

## Tips

1. **Keep titles short** - Use 1-3 words for titles
2. **Be specific in messages** - Tell users exactly what happened
3. **Use appropriate types** - Match the alert type to the situation
4. **Set reasonable durations** - 5s for success, 7s for errors
5. **Always confirm destructive actions** - Use confirm dialogs for deletes

## Browser Support

Works in all modern browsers that support:
- CSS backdrop-filter
- CSS animations
- ES6+ JavaScript

## License

Part of the LS Manager application.
