import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Catches rendering errors in child tree and displays fallback UI.
 * Must be a class component (React limitation for error boundaries).
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("[ErrorBoundary]", error, info.componentStack);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[200px]">
                    <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Something went wrong
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            {this.state.error?.message || "An unexpected error occurred."}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={this.handleRetry}
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
