import React from "react";

declare global {
    interface Window {
        snsWebSdk?: any;
    }

    namespace React.JSX {
        interface IntrinsicElements {
            "metamap-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                clientid?: string;
                flowid?: string;
                metadata?: string;
            };
        }
    }

    namespace JSX {
        interface IntrinsicElements {
            "metamap-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                clientid?: string;
                flowid?: string;
                metadata?: string;
            };
        }
    }
}
