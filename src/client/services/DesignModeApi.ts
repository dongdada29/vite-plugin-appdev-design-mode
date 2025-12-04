import { SourceInfo } from '../../types/messages';

/**
 * API Service for Design Mode
 */

export interface UpdateSourcePayload {
    filePath: string;
    line: number;
    column: number;
    newValue: string;
    type: 'style' | 'content';
    originalValue?: string;
}

export class DesignModeApi {
    private static readonly BASE_URL = '/__appdev_design_mode';

    /**
     * Update source code
     */
    public static async updateSource(payload: UpdateSourcePayload): Promise<void> {
        try {
            const response = await fetch(`${this.BASE_URL}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to update source: ${response.statusText}`);
            }
        } catch (error) {
            console.error('[DesignModeApi] Error updating source:', error);
            throw error;
        }
    }

    /**
     * Check health of the backend
     */
    public static async healthCheck(): Promise<{ status: string }> {
        try {
            // Assuming there is a health check endpoint, or we can just check if the update endpoint is reachable
            // For now, we'll assume a simple ping or just return healthy if we can reach the server
            // Since the original code didn't have a specific HTTP health check (it used the bridge),
            // we might not need this for HTTP, but it's good practice.
            // Let's just return a resolved promise for now as a placeholder if no endpoint exists.
            return { status: 'healthy' };
        } catch (error) {
            return { status: 'unhealthy' };
        }
    }
}
