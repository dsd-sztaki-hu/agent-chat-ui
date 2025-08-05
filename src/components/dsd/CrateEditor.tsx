"use client";
import React, {useState, useEffect, useRef, forwardRef} from 'react';
import {createPortal} from 'react-dom';
import {JSONObject} from "@arpproject/crate-builder-component-react";
import dynamic from "next/dynamic";
import {css} from "./crate-builder-style";
import { useStreamContext } from "@/providers/Stream";

// Import the DescriboCrateBuilder component dynamically to avoid server-side rendering issues
const DescriboCrateBuilder = dynamic(
    () => import("@arpproject/crate-builder-component-react").then(mod => mod.DescriboCrateBuilder),
    {
        ssr: false,
        loading: () => <p>Loading...</p>
    }
);
const crateEditor = {
  "@context": "https://w3id.org/ro/crate/1.1/context",
  "@graph": [
    {
      "@type": "CreativeWork",
      "@id": "ro-crate-metadata.json",
      "conformsTo": {"@id": "https://w3id.org/ro/crate/1.1"},
      "about": {"@id": "./"}
    },
    {
      "@id": "./",
      "identifier": "https://doi.org/10.4225/59/11111111",
      "@type": "Dataset",
      "datePublished": "2017",
      "name": "Dataset name",
      "description": "Dataset description",
    }
  ]
}

// HACK: This component creates a Shadow DOM to isolate the styles of its children.
// This is necessary because the DescriboCrateBuilder component imports a CSS file
// with global styles that conflict with the rest of the application.
const ShadowDom = forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => {
    const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
    const internalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (internalRef.current) {
            // Ensure the shadow root is only attached once, even in React's Strict Mode.
            if (!internalRef.current.shadowRoot) {
                const shadow = internalRef.current.attachShadow({mode: 'open'});

                // HACK: Inject the component's own CSS as a string.
                // This ensures the styles are scoped to the Shadow DOM.
                const style = document.createElement('style');
                style.textContent = css;
                shadow.appendChild(style);

                // HACK: Inject Font Awesome from a CDN.
                // The Shadow DOM does not inherit fonts or styles from the main document,
                // so we need to load them explicitly within the shadow tree.
                const fontAwesome = document.createElement('link');
                fontAwesome.rel = 'stylesheet';
                fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css';
                shadow.appendChild(fontAwesome);

                // HACK: Force Font Awesome SVGs to display correctly.
                // Other styles within the Shadow DOM were likely overriding the default
                // display properties of the Font Awesome icons, making them invisible.
                const faStyle = document.createElement('style');
                faStyle.textContent = `
                  .svg-inline--fa {
                    display: inline-block;
                    height: 1em;
                    overflow: visible;
                    vertical-align: -0.125em;
                  }
                `;
                shadow.appendChild(faStyle);

                // Create a mount point for the React portal.
                const mountPoint = document.createElement('div');
                shadow.appendChild(mountPoint);
                setShadowRoot(shadow);
            }
        }
    }, []);

    return (
        <div ref={internalRef}>
            {/* Use a portal to render the children into the Shadow DOM. */}
            {shadowRoot && createPortal(children, shadowRoot.querySelector('div')!)}
        </div>
    );
});
ShadowDom.displayName = 'ShadowDom';

export function CrateEditor(props: {
  inputCrate?: JSONObject,
  readOnly?: boolean,
  interruptActions?: Record<string, string> // like { "accept": "Accept", "deny": "Deny", "edit": "Edit" }
}) {
  const [updatedCrate, setUpdatedCrate] = useState<JSONObject>(crateEditor)
  const thread = useStreamContext();
  return (
    <>
      <ShadowDom>
        <DescriboCrateBuilder crate={props.inputCrate} onSaveCrate={(crateValue) => setUpdatedCrate(crateValue.crate)} />
      </ShadowDom>
      <div>
      <button
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => {
          thread.submit(
            {},
            {
              command: {
                resume: {
                  updated_ro_crate_json: updatedCrate,
                },
              },
            }
          );
        }}
      >
        Update Crate
      </button>
      </div>
    </>
  );
}
