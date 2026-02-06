/**
 * Custom Alert & Confirm Usage Examples
 * 
 * This file demonstrates how to use the custom alert and confirm dialogs
 * throughout the application.
 */

import { useAlert } from '../components/ui/AlertProvider';
import { useConfirm } from '../components/ui/ConfirmProvider';

// Example Component
export const ExampleUsage = () => {
    const alert = useAlert();
    const confirm = useConfirm();

    // ============================================
    // ALERT EXAMPLES
    // ============================================

    const showSuccessAlert = () => {
        alert.success(
            'Success!',
            'Your changes have been saved successfully.',
            5000 // Duration in ms (optional, default is 5000)
        );
    };

    const showErrorAlert = () => {
        alert.error(
            'Error Occurred',
            'Failed to save changes. Please try again.',
            7000
        );
    };

    const showWarningAlert = () => {
        alert.warning(
            'Warning',
            'This action cannot be undone. Please proceed with caution.'
        );
    };

    const showInfoAlert = () => {
        alert.info(
            'Information',
            'New features are now available in the dashboard.'
        );
    };

    // Generic alert with custom type
    const showCustomAlert = () => {
        alert.showAlert(
            'success',
            'Custom Alert',
            'This is a custom alert message',
            3000
        );
    };

    // ============================================
    // CONFIRM DIALOG EXAMPLES
    // ============================================

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Delete Item',
            message: 'Are you sure you want to delete this item? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (confirmed) {
            // User clicked "Delete"
            alert.success('Deleted', 'Item has been deleted successfully.');
        } else {
            // User clicked "Cancel" or closed the dialog
            alert.info('Cancelled', 'Delete action was cancelled.');
        }
    };

    const handleWarningAction = async () => {
        const confirmed = await confirm({
            title: 'Proceed with Caution',
            message: 'This action may have unintended consequences. Do you want to continue?',
            confirmText: 'Yes, Continue',
            cancelText: 'No, Go Back',
            type: 'warning'
        });

        if (confirmed) {
            alert.success('Action Completed', 'The action was completed successfully.');
        }
    };

    const handleInfoAction = async () => {
        const confirmed = await confirm({
            title: 'Confirmation Required',
            message: 'Please confirm that you want to proceed with this action.',
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            type: 'info'
        });

        if (confirmed) {
            alert.success('Confirmed', 'Your action has been confirmed.');
        }
    };

    // ============================================
    // REAL-WORLD EXAMPLES
    // ============================================

    // Example: Delete with API call
    const deleteEmployee = async (employeeId: string) => {
        const confirmed = await confirm({
            title: 'Delete Employee',
            message: 'Are you sure you want to delete this employee? All associated data will be permanently removed.',
            confirmText: 'Delete Employee',
            cancelText: 'Keep Employee',
            type: 'danger'
        });

        if (confirmed) {
            try {
                // await api.delete(`/employees/${employeeId}`);
                alert.success('Employee Deleted', 'The employee has been removed from the system.');
            } catch (error) {
                alert.error('Delete Failed', 'Failed to delete employee. Please try again.');
            }
        }
    };

    // Example: Save with validation
    const saveChanges = async (data: any) => {
        if (!data.name || !data.email) {
            alert.warning('Validation Error', 'Please fill in all required fields.');
            return;
        }

        try {
            // await api.post('/save', data);
            alert.success('Saved!', 'Your changes have been saved successfully.');
        } catch (error) {
            alert.error('Save Failed', 'An error occurred while saving. Please try again.');
        }
    };

    // Example: Approve action
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
                // await api.patch(`/wages/${wageId}/status`, { status: 'APPROVED' });
                alert.success('Wage Approved', 'The wage has been approved for payment.');
            } catch (error) {
                alert.error('Approval Failed', 'Failed to approve wage. Please try again.');
            }
        }
    };

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold text-white mb-6">Alert & Confirm Examples</h1>

            <div className="space-y-2">
                <h2 className="text-lg font-semibold text-white">Alerts</h2>
                <button onClick={showSuccessAlert} className="px-4 py-2 bg-green-600 text-white rounded">
                    Show Success Alert
                </button>
                <button onClick={showErrorAlert} className="px-4 py-2 bg-red-600 text-white rounded ml-2">
                    Show Error Alert
                </button>
                <button onClick={showWarningAlert} className="px-4 py-2 bg-amber-600 text-white rounded ml-2">
                    Show Warning Alert
                </button>
                <button onClick={showInfoAlert} className="px-4 py-2 bg-blue-600 text-white rounded ml-2">
                    Show Info Alert
                </button>
            </div>

            <div className="space-y-2">
                <h2 className="text-lg font-semibold text-white">Confirm Dialogs</h2>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">
                    Delete Action (Danger)
                </button>
                <button onClick={handleWarningAction} className="px-4 py-2 bg-amber-600 text-white rounded ml-2">
                    Warning Action
                </button>
                <button onClick={handleInfoAction} className="px-4 py-2 bg-blue-600 text-white rounded ml-2">
                    Info Action
                </button>
            </div>
        </div>
    );
};

/**
 * QUICK REFERENCE:
 * 
 * Import:
 * import { useAlert } from '@/components/ui/AlertProvider';
 * import { useConfirm } from '@/components/ui/ConfirmProvider';
 * 
 * Usage in component:
 * const alert = useAlert();
 * const confirm = useConfirm();
 * 
 * Show alerts:
 * alert.success('Title', 'Message');
 * alert.error('Title', 'Message');
 * alert.warning('Title', 'Message');
 * alert.info('Title', 'Message');
 * 
 * Show confirm dialog:
 * const confirmed = await confirm({
 *   title: 'Title',
 *   message: 'Message',
 *   confirmText: 'Yes',
 *   cancelText: 'No',
 *   type: 'danger' | 'warning' | 'info'
 * });
 * 
 * if (confirmed) {
 *   // User confirmed
 * }
 */
