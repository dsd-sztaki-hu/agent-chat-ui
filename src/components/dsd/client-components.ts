'use client'
import { CrateEditor } from "@/components/dsd/CrateEditor";

/**
 * Maps component names to their React implementations.
 *
 * This registry is used when an agent calls `push_ui_message` to render a custom UI component.
 * The `component_name` passed from the agent must match a key in this object.
 *
 * @example Agent-side call
 * push_ui_message(
 *   "some_component_name",
 *   { "city": "Budapest" },
 *   message=messageToHaveCustomUiFor,
 * )
 *
 * Note: Agents can optionally provide component implementations directly,
 * in which case they do not need to be registered here.
 */
export const clientComponents = {
  // "some_component_name": SomeComponentImplementation
  "crate_editor": CrateEditor
};
