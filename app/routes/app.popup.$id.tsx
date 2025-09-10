import { useState, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, useParams } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  TextField,
  Select,
  Checkbox,
  BlockStack,
  InlineStack,
  Text,
  Tabs,
  Box,
  Badge,
  RangeSlider,
  FormLayout,
  Banner,
  Divider,
  DropZone,
  Thumbnail,
  Icon,
} from "@shopify/polaris";
import { PlusIcon, DeleteIcon } from "@shopify/polaris-icons";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";
import { ColorPickerField } from "../components/ColorPickerField";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { id } = params;

  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }

  const popup = await db.popup.findUnique({
    where: { id, shop: session.shop },
  });

  if (!popup) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ popup });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { id } = params;
  
  if (!id) {
    return json({ error: "Invalid popup ID" }, { status: 400 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "delete") {
    await db.popup.delete({
      where: { id, shop: session.shop },
    });
    return redirect("/app");
  }

  const updateData: any = {};
  
  // Multi-step tab
  const isMultiStep = formData.get("isMultiStep");
  if (isMultiStep !== null) updateData.isMultiStep = isMultiStep === "true";
  
  const sections = formData.get("sections") as string;
  if (sections !== null) updateData.sections = sections;
  
  
  // Phone field settings
  const enablePhoneField = formData.get("enablePhoneField");
  if (enablePhoneField !== null) updateData.enablePhoneField = enablePhoneField === "true";
  
  const phoneRequired = formData.get("phoneRequired");
  if (phoneRequired !== null) updateData.phoneRequired = phoneRequired === "true";
  
  const phonePlaceholder = formData.get("phonePlaceholder") as string;
  if (phonePlaceholder !== null) updateData.phonePlaceholder = phonePlaceholder;

  // Footer text (now global setting)
  const footerText = formData.get("footerText") as string;
  if (footerText !== null) updateData.footerText = footerText;

  // Style tab
  const logoUrl = formData.get("logoUrl") as string;
  if (logoUrl !== null) updateData.logoUrl = logoUrl;
  
  const logoWidth = formData.get("logoWidth") as string;
  if (logoWidth) updateData.logoWidth = parseInt(logoWidth);
  
  const displaySize = formData.get("displaySize") as string;
  if (displaySize) updateData.displaySize = displaySize;
  
  const alignment = formData.get("alignment") as string;
  if (alignment) updateData.alignment = alignment;
  
  const cornerRadius = formData.get("cornerRadius") as string;
  if (cornerRadius) updateData.cornerRadius = cornerRadius;
  
  const imagePosition = formData.get("imagePosition") as string;
  if (imagePosition) updateData.imagePosition = imagePosition;
  
  const hideOnMobile = formData.get("hideOnMobile");
  if (hideOnMobile !== null) updateData.hideOnMobile = hideOnMobile === "true";
  
  const backgroundOnMobile = formData.get("backgroundOnMobile");
  if (backgroundOnMobile !== null) updateData.backgroundOnMobile = backgroundOnMobile === "true";
  
  const imageUrl = formData.get("imageUrl") as string;
  if (imageUrl !== null) updateData.imageUrl = imageUrl;

  // Colors
  const popupBackground = formData.get("popupBackground") as string;
  if (popupBackground !== null) updateData.popupBackground = popupBackground;
  
  const textHeading = formData.get("textHeading") as string;
  if (textHeading !== null) updateData.textHeading = textHeading;
  
  const textDescription = formData.get("textDescription") as string;
  if (textDescription !== null) updateData.textDescription = textDescription;
  
  const textInput = formData.get("textInput") as string;
  if (textInput !== null) updateData.textInput = textInput;
  
  const textConsent = formData.get("textConsent") as string;
  if (textConsent !== null) updateData.textConsent = textConsent;
  
  const textError = formData.get("textError") as string;
  if (textError !== null) updateData.textError = textError;
  
  const textLabel = formData.get("textLabel") as string;
  if (textLabel !== null) updateData.textLabel = textLabel;
  
  const textFooter = formData.get("textFooter") as string;
  if (textFooter !== null) updateData.textFooter = textFooter;
  
  const primaryBtnBg = formData.get("primaryBtnBg") as string;
  if (primaryBtnBg !== null) updateData.primaryBtnBg = primaryBtnBg;
  
  const primaryBtnText = formData.get("primaryBtnText") as string;
  if (primaryBtnText !== null) updateData.primaryBtnText = primaryBtnText;
  
  const secondaryBtnText = formData.get("secondaryBtnText") as string;
  if (secondaryBtnText !== null) updateData.secondaryBtnText = secondaryBtnText;

  const customButtons = formData.get("customButtons") as string;
  if (customButtons !== null) updateData.customButtons = customButtons;
  
  const customBtnBg = formData.get("customBtnBg") as string;
  if (customBtnBg !== null) updateData.customBtnBg = customBtnBg;
  
  const customBtnText = formData.get("customBtnText") as string;
  if (customBtnText !== null) updateData.customBtnText = customBtnText;

  try {
    await db.popup.update({
      where: { id, shop: session.shop },
      data: updateData,
    });

    return json({ success: true });
  } catch (error) {
    console.error("Error updating popup:", error);
    return json({ error: "Failed to update popup" }, { status: 500 });
  }
};

export default function PopupEditor() {
  const { popup } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const [selectedTab, setSelectedTab] = useState(0);
  const [previewStep, setPreviewStep] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedSectionForDesign, setSelectedSectionForDesign] = useState<number | null>(null);
  const [selectedButtonForDesign, setSelectedButtonForDesign] = useState<string | null>(null);
  const [buttonColors, setButtonColors] = useState<{[key: string]: {backgroundColor: string, textColor: string, style: string}}>({});
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [logoUploading, setLogoUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  // Helper function to convert legacy buttons to customButtons format
  const convertLegacyButtons = () => {
    const buttons = [];
    
    // Convert existing customButtons if they exist
    if (popup.customButtons) {
      try {
        const existingButtons = JSON.parse(popup.customButtons);
        buttons.push(...existingButtons);
      } catch (e) {
        console.warn("Failed to parse existing customButtons");
      }
    }
    
    // If no custom buttons exist, create from legacy fields only (no defaults)
    if (buttons.length === 0) {
      // No legacy buttons to convert since we removed primaryButton and secondaryButton from schema
    }
    
    return buttons;
  };
  
  const [formData, setFormData] = useState({
    // Multi-step
    isMultiStep: popup.isMultiStep || false,
    sections: popup.sections ? JSON.parse(popup.sections) : [{
      id: 1,
      type: "universal",
      title: "Email Capture",
      order: 0,
      content: {
        // Basic content
        heading: popup.heading || "Get 10% OFF your order",
        description: popup.description || "Sign up and unlock your instant discount.",
        
        // Email capture fields
        enableEmailCapture: true, // Default first section has email capture
        emailPlaceholder: popup.emailPlaceholder || "Email address",
        
        // Unified custom buttons system (with default button if none exist)
        customButtons: convertLegacyButtons().length > 0 ? convertLegacyButtons() : [{
          id: "default",
          text: "New Button", 
          action: "close_popup",
          style: "outline"
        }],
        
        // Additional elements
        footerText: popup.footerText || "You are signing up to receive communication via email and can unsubscribe at any time.",
        imageUrl: ""
      },
      design: {
        // Individual section design settings
        logoUrl: "",
        logoWidth: 35,
        displaySize: "standard",
        alignment: "center",
        cornerRadius: "standard",
        imagePosition: "none",
        hideOnMobile: false,
        backgroundOnMobile: false,
        imageUrl: "",
        popupBackground: "#FFFFFF",
        textHeading: "#000000",
        textDescription: "#666666",
        textInput: "#000000",
        textConsent: "#666666",
        textError: "#FF0000",
        textLabel: "#000000",
        textFooter: "#999999",
        primaryBtnBg: "#000000",
        primaryBtnText: "#FFFFFF",
        secondaryBtnText: "#666666",
        customBtnBg: "#E5E5E5",
        customBtnText: "#000000"
      }
    }],
    
    // Global content
    footerText: popup.footerText || "",
    
    // Style
    logoUrl: popup.logoUrl || "",
    logoWidth: popup.logoWidth || 35,
    displaySize: popup.displaySize || "standard",
    alignment: popup.alignment || "center",
    cornerRadius: popup.cornerRadius || "standard",
    imagePosition: popup.imagePosition || "none",
    hideOnMobile: popup.hideOnMobile,
    backgroundOnMobile: popup.backgroundOnMobile,
    imageUrl: popup.imageUrl || "",
    
    // Colors
    popupBackground: popup.popupBackground || "#FFFFFF",
    textHeading: popup.textHeading || "#000000",
    textDescription: popup.textDescription || "#666666",
    textInput: popup.textInput || "#000000",
    textConsent: popup.textConsent || "#666666",
    textError: popup.textError || "#FF0000",
    textLabel: popup.textLabel || "#000000",
    textFooter: popup.textFooter || "#999999",
    primaryBtnBg: popup.primaryBtnBg || "#000000",
    primaryBtnText: popup.primaryBtnText || "#FFFFFF",
    secondaryBtnText: popup.secondaryBtnText || "#666666",
    
    // Custom Buttons
    customButtons: popup.customButtons ? JSON.parse(popup.customButtons) : [],
    customBtnBg: popup.customBtnBg || "#E5E5E5",
    customBtnText: popup.customBtnText || "#000000",
  });

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show("Popup saved successfully");
    } else if (fetcher.data?.error) {
      shopify.toast.show(fetcher.data.error, { isError: true });
    }
  }, [fetcher.data, shopify]);

  // Initialize button colors when a button is selected
  useEffect(() => {
    if (selectedButtonForDesign && !buttonColors[selectedButtonForDesign]) {
      const currentButtonColors = getButtonStyle(selectedButtonForDesign, "backgroundColor");
      const currentTextColors = getButtonStyle(selectedButtonForDesign, "textColor");
      const currentStyle = getButtonStyle(selectedButtonForDesign, "style");
      
      setButtonColors(prev => ({
        ...prev,
        [selectedButtonForDesign]: {
          backgroundColor: currentButtonColors || (selectedButtonForDesign === "primary" ? "#000000" : "#E5E5E5"),
          textColor: currentTextColors || (selectedButtonForDesign === "primary" ? "#FFFFFF" : "#000000"),
          style: currentStyle || (selectedButtonForDesign === "primary" ? "filled" : "outline")
        }
      }));
    }
  }, [selectedButtonForDesign, selectedSectionForDesign, buttonColors]);

  const handleSave = () => {
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "customButtons" || key === "sections") {
        form.append(key, JSON.stringify(value));
      } else {
        form.append(key, value.toString());
      }
    });
    fetcher.submit(form, { method: "POST" });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this popup?")) {
      fetcher.submit({ intent: "delete" }, { method: "POST" });
    }
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Updated design handler to work with section-specific design
  const updateDesignField = (field: string, value: any) => {
    if (selectedSectionForDesign) {
      updateSectionDesign(selectedSectionForDesign, field, value);
    } else {
      // Update global settings
      updateFormData(field, value);
      
      // For single-step popups, also update the first section's design
      if (!formData.isMultiStep && formData.sections.length > 0) {
        updateSectionDesign(formData.sections[0].id, field, value);
      }
    }
  };

  const getDesignFieldValue = (field: string) => {
    if (selectedSectionForDesign) {
      const section = formData.sections.find((s: any) => s.id === selectedSectionForDesign);
      return section?.design?.[field] ?? formData[field];
    }
    
    // For single-step popups without selected section, check first section's design first
    if (!formData.isMultiStep && formData.sections.length > 0) {
      const firstSection = formData.sections[0];
      return firstSection?.design?.[field] ?? formData[field];
    }
    
    return formData[field];
  };

  const handleLogoUpload = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setLogoUploading(true);
      setLogoFiles(files);
      
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "logo");
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        const result = await response.json();
        
        if (result.success) {
          updateDesignField("logoUrl", result.url);
          shopify.toast.show("Logo uploaded successfully");
        } else {
          shopify.toast.show(result.error || "Failed to upload logo", { isError: true });
          setLogoFiles([]);
        }
      } catch (error) {
        shopify.toast.show("Failed to upload logo", { isError: true });
        setLogoFiles([]);
      } finally {
        setLogoUploading(false);
      }
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setImageUploading(true);
      setImageFiles(files);
      
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "image");
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        const result = await response.json();
        
        if (result.success) {
          updateDesignField("imageUrl", result.url);
          shopify.toast.show("Image uploaded successfully");
        } else {
          shopify.toast.show(result.error || "Failed to upload image", { isError: true });
          setImageFiles([]);
        }
      } catch (error) {
        shopify.toast.show("Failed to upload image", { isError: true });
        setImageFiles([]);
      } finally {
        setImageUploading(false);
      }
    }
  };

  const removeLogo = () => {
    setLogoFiles([]);
    updateDesignField("logoUrl", "");
  };

  const removeImage = () => {
    setImageFiles([]);
    updateDesignField("imageUrl", "");
  };

  const addCustomButton = () => {
    const newButton = {
      id: Date.now(),
      text: "New Button",
      action: "link",
      url: "",
      style: "outline"
    };
    updateFormData("customButtons", [...formData.customButtons, newButton]);
  };

  const updateCustomButton = (id: number, field: string, value: string) => {
    const updatedButtons = formData.customButtons.map((btn: any) =>
      btn.id === id ? { ...btn, [field]: value } : btn
    );
    updateFormData("customButtons", updatedButtons);
  };

  const removeCustomButton = (id: number) => {
    const filteredButtons = formData.customButtons.filter((btn: any) => btn.id !== id);
    updateFormData("customButtons", filteredButtons);
  };

  // Section Custom Buttons functions
  const addSectionCustomButton = (sectionId: number) => {
    const newButton = {
      id: Date.now(),
      text: "New Button",
      action: "link",
      url: "",
      style: "outline",
      buttonStyle: {
        backgroundColor: formData.customBtnBg || "#E5E5E5",
        textColor: formData.customBtnText || "#000000",
        style: "outline"
      }
    };
    
    const updatedSections = formData.sections.map((section: any) =>
      section.id === sectionId 
        ? { 
            ...section, 
            content: { 
              ...section.content, 
              customButtons: [...(section.content.customButtons || []), newButton] 
            } 
          }
        : section
    );
    updateFormData("sections", updatedSections);
  };

  const updateSectionCustomButton = (sectionId: number, buttonId: number, field: string, value: string) => {
    const updatedSections = formData.sections.map((section: any) =>
      section.id === sectionId 
        ? { 
            ...section, 
            content: { 
              ...section.content, 
              customButtons: (section.content.customButtons || []).map((btn: any) =>
                btn.id === buttonId ? { ...btn, [field]: value } : btn
              )
            } 
          }
        : section
    );
    updateFormData("sections", updatedSections);
  };

  const removeSectionCustomButton = (sectionId: number, buttonId: number) => {
    const updatedSections = formData.sections.map((section: any) =>
      section.id === sectionId 
        ? { 
            ...section, 
            content: { 
              ...section.content, 
              customButtons: (section.content.customButtons || []).filter((btn: any) => btn.id !== buttonId)
            } 
          }
        : section
    );
    updateFormData("sections", updatedSections);
  };

  // Section management functions
  const addSection = (type: "intro" | "email_capture" | "custom" | "universal") => {
    const sectionNumber = formData.sections.length + 1;
    const newSection = {
      id: Date.now(),
      type: "universal", // All sections are now universal
      title: `Section ${sectionNumber}`,
      order: formData.sections.length,
      content: {
        // Basic content with neutral defaults
        heading: `Section ${sectionNumber}`,
        description: "Add your content here",
        
        // Email capture fields (disabled by default)
        enableEmailCapture: false,
        emailPlaceholder: "Email address",
        
        // Unified custom buttons system (always include default button)
        customButtons: [{
          id: "default",
          text: "New Button", 
          action: "close_popup",
          style: "outline"
        }],
        footerText: "",
        imageUrl: ""
      },
      design: {
        // Individual section design settings
        logoUrl: "",
        logoWidth: 35,
        displaySize: "standard",
        alignment: "center",
        cornerRadius: "standard",
        imagePosition: "none",
        hideOnMobile: false,
        backgroundOnMobile: false,
        imageUrl: "",
        popupBackground: "#FFFFFF",
        textHeading: "#000000",
        textDescription: "#666666",
        textInput: "#000000",
        textConsent: "#666666",
        textError: "#FF0000",
        textLabel: "#000000",
        textFooter: "#999999",
        primaryBtnBg: "#000000",
        primaryBtnText: "#FFFFFF",
        secondaryBtnText: "#666666",
        customBtnBg: "#E5E5E5",
        customBtnText: "#000000"
      }
    };
    updateFormData("sections", [...formData.sections, newSection]);
  };

  const updateSection = (id: number, field: string, value: any) => {
    const updatedSections = formData.sections.map((section: any) =>
      section.id === id ? { ...section, [field]: value } : section
    );
    updateFormData("sections", updatedSections);
  };

  const updateSectionDesign = (id: number, designField: string, value: any) => {
    const updatedSections = formData.sections.map((section: any) =>
      section.id === id 
        ? { ...section, design: { ...section.design, [designField]: value } }
        : section
    );
    updateFormData("sections", updatedSections);
  };

  const updateSectionContent = (id: number, contentField: string, value: string) => {
    const updatedSections = formData.sections.map((section: any) =>
      section.id === id 
        ? { ...section, content: { ...section.content, [contentField]: value } }
        : section
    );
    updateFormData("sections", updatedSections);
  };

  const removeSection = (id: number) => {
    // Don't allow removing the last section
    if (formData.sections.length <= 1) {
      return;
    }
    
    const filteredSections = formData.sections.filter((section: any) => section.id !== id);
    // Reorder sections
    const reorderedSections = filteredSections.map((section: any, index: number) => ({
      ...section,
      order: index
    }));
    updateFormData("sections", reorderedSections);
  };

  const moveSection = (id: number, direction: "up" | "down") => {
    const currentIndex = formData.sections.findIndex((section: any) => section.id === id);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === formData.sections.length - 1)
    ) return;

    const newSections = [...formData.sections];
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    [newSections[currentIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[currentIndex]];
    
    // Update order
    const reorderedSections = newSections.map((section: any, index: number) => ({
      ...section,
      order: index
    }));
    
    updateFormData("sections", reorderedSections);
  };

  // Button styling functions
  const updateButtonStyle = (buttonId: string, styleField: string, value: any) => {
    // First update the local button colors state for immediate UI feedback
    setButtonColors(prev => ({
      ...prev,
      [buttonId]: {
        ...prev[buttonId],
        [styleField]: value
      }
    }));

    if (buttonId === "primary") {
      // Update primary button style
      if (selectedSectionForDesign) {
        const updatedSections = formData.sections.map((section: any) =>
          section.id === selectedSectionForDesign
            ? {
                ...section,
                content: {
                  ...section.content,
                  primaryButtonStyle: {
                    backgroundColor: "#000000",
                    textColor: "#FFFFFF", 
                    style: "filled",
                    ...section.content.primaryButtonStyle,
                    [styleField]: value
                  }
                }
              }
            : section
        );
        updateFormData("sections", updatedSections);
      } else {
        // Update first section for single-step popups
        const updatedSections = formData.sections.map((section: any, index: number) =>
          index === 0
            ? {
                ...section,
                content: {
                  ...section.content,
                  primaryButtonStyle: {
                    backgroundColor: "#000000",
                    textColor: "#FFFFFF",
                    style: "filled",
                    ...section.content.primaryButtonStyle,
                    [styleField]: value
                  }
                }
              }
            : section
        );
        updateFormData("sections", updatedSections);
        
        // Also update global values for compatibility
        if (styleField === "backgroundColor") {
          updateFormData("primaryBtnBg", value);
        } else if (styleField === "textColor") {
          updateFormData("primaryBtnText", value);
        }
      }
    } else if (buttonId.startsWith("custom-")) {
      // Update custom button style
      const customButtonId = parseInt(buttonId.replace("custom-", ""));
      const sectionId = selectedSectionForDesign || formData.sections[0]?.id;
      
      const updatedSections = formData.sections.map((section: any) =>
        section.id === sectionId
          ? {
              ...section,
              content: {
                ...section.content,
                customButtons: (section.content.customButtons || []).map((btn: any) =>
                  btn.id === customButtonId
                    ? {
                        ...btn,
                        buttonStyle: {
                          backgroundColor: "#E5E5E5",
                          textColor: "#000000",
                          style: "outline",
                          ...btn.buttonStyle,
                          [styleField]: value
                        }
                      }
                    : btn
                )
              }
            }
          : section
      );
      updateFormData("sections", updatedSections);
      
      // Also update global values for compatibility
      if (styleField === "backgroundColor") {
        updateFormData("customBtnBg", value);
      } else if (styleField === "textColor") {
        updateFormData("customBtnText", value);
      }
    }
  };

  const getButtonStyle = (buttonId: string, styleField: string) => {
    const currentSection = selectedSectionForDesign 
      ? formData.sections.find((s: any) => s.id === selectedSectionForDesign)
      : formData.sections[0];
    
    if (buttonId === "primary") {
      const primaryStyle = currentSection?.content?.primaryButtonStyle;
      if (styleField === "backgroundColor") {
        return primaryStyle?.backgroundColor || formData.primaryBtnBg || "#000000";
      } else if (styleField === "textColor") {
        return primaryStyle?.textColor || formData.primaryBtnText || "#FFFFFF";
      } else if (styleField === "style") {
        return primaryStyle?.style || "filled";
      }
    } else if (buttonId.startsWith("custom-")) {
      const customButtonId = parseInt(buttonId.replace("custom-", ""));
      const customButton = (currentSection?.content?.customButtons || [])
        .find((btn: any) => btn.id === customButtonId);
      const buttonStyle = customButton?.buttonStyle;
      
      if (styleField === "backgroundColor") {
        return buttonStyle?.backgroundColor || formData.customBtnBg || "#E5E5E5";
      } else if (styleField === "textColor") {
        return buttonStyle?.textColor || formData.customBtnText || "#000000";
      } else if (styleField === "style") {
        return buttonStyle?.style || "outline";
      }
    }
    
    return "";
  };

  // Preview navigation functions
  const nextStep = () => {
    if (previewStep < formData.sections.length - 1) {
      setPreviewStep(previewStep + 1);
    }
  };

  const prevStep = () => {
    if (previewStep > 0) {
      setPreviewStep(previewStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < formData.sections.length) {
      setPreviewStep(step);
    }
  };

  // Reset preview step when multi-step is toggled or sections change
  useEffect(() => {
    if (!formData.isMultiStep || previewStep >= formData.sections.length) {
      setPreviewStep(0);
    }
  }, [formData.isMultiStep, formData.sections.length, previewStep]);

  // Get current section for preview
  const getCurrentSection = () => {
    if (!formData.isMultiStep) {
      // For single-step popups, always use the first section if available
      if (formData.sections.length > 0) {
        return formData.sections[0];
      }
      // Fallback to default content with design settings
      return {
        type: "email_capture",
        content: {
          heading: "Get 10% OFF your order",
          description: "Sign up and unlock your instant discount.",
          emailPlaceholder: "Email address"
        },
        design: {
          // Use global design settings as fallback
          ...formData
        }
      };
    }
    return formData.sections[previewStep] || formData.sections[0];
  };

  // Helper function to get effective design settings for a section (with fallbacks to global settings)
  const getEffectiveDesign = (section: any) => {
    if (!section?.design) return formData; // Use global settings as fallback
    
    return {
      ...formData, // Global defaults
      ...section.design // Override with section-specific settings
    };
  };

  const currentSection = getCurrentSection();
  const currentSectionDesign = getEffectiveDesign(currentSection);

  const tabs = [
    { id: "steps", content: "Steps" },
    { id: "design", content: "Design" },
  ];

  return (
    <Page fullWidth>
      <TitleBar title={`Opt in Popup - ${popup.name}`}>
        <Button variant="secondary" onClick={handleDelete}>
          Delete
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSave}
          loading={fetcher.state === "submitting"}
        >
          Save
        </Button>
      </TitleBar>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        gap: "20px",
        minHeight: "100vh",
        padding: "0 20px"
      }}>
        <div>
          <Card>
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">Opt in popup</Text>
              
              <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={setSelectedTab}
              />
              
              {/* Steps Tab */}
              {selectedTab === 0 && (
                <BlockStack gap="400">
                  <Text as="h4" variant="headingMd">Popup Steps</Text>
                  <Text as="p" variant="bodyMd">
                    Configure multiple steps for your popup to create a more engaging experience.
                  </Text>
                  
                  <Checkbox
                    label="Enable multi-step popup"
                    checked={formData.isMultiStep}
                    onChange={(checked) => updateFormData("isMultiStep", checked)}
                    helpText="When enabled, users will navigate through multiple sections before reaching the final action."
                  />
                  
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <Text as="h5" variant="headingSm">SECTIONS ({formData.sections.length})</Text>
                      {formData.isMultiStep && (
                        <Button 
                          size="micro" 
                          onClick={() => addSection("intro")}
                          icon={PlusIcon}
                        >
                          Add Section
                        </Button>
                      )}
                    </InlineStack>
                      
                      {formData.sections.map((section: any, index: number) => (
                        <Card key={section.id}>
                          <BlockStack gap="300">
                            <InlineStack gap="300" align="space-between">
                              <InlineStack gap="200" align="center">
                                <Text as="span" variant="bodyMd" tone="subdued">#{index + 1}</Text>
                                <Text as="h6" variant="headingSm">{section.title || `Section ${index + 1}`}</Text>
                                {section.content.enableEmailCapture && (
                                  <Badge tone="success">Email Capture</Badge>
                                )}
                              </InlineStack>
                              
                              {formData.isMultiStep && (
                                <InlineStack gap="200">
                                  <Button
                                    size="micro"
                                    variant="plain"
                                    onClick={() => moveSection(section.id, "up")}
                                    disabled={index === 0}
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    size="micro"
                                    variant="plain"
                                    onClick={() => moveSection(section.id, "down")}
                                    disabled={index === formData.sections.length - 1}
                                  >
                                    ↓
                                  </Button>
                                  <Button 
                                    size="micro" 
                                    variant="plain" 
                                    onClick={() => removeSection(section.id)}
                                    icon={DeleteIcon}
                                    disabled={formData.sections.length === 1}
                                  />
                                </InlineStack>
                              )}
                            </InlineStack>
                            
                            
                            {formData.isMultiStep && (
                              <TextField
                                label="Section title"
                                value={section.title}
                                onChange={(value) => updateSection(section.id, "title", value)}
                                placeholder="Enter section title"
                              />
                            )}
                            
                            <BlockStack gap="300">
                              <Text as="h6" variant="headingSm">CONTENT</Text>
                              <TextField
                                label="Heading"
                                value={section.content.heading || ""}
                                onChange={(value) => updateSectionContent(section.id, "heading", value)}
                                maxLength={50}
                                placeholder="Enter section heading"
                              />
                              <TextField
                                label="Description"
                                value={section.content.description || ""}
                                onChange={(value) => updateSectionContent(section.id, "description", value)}
                                multiline={3}
                                placeholder="Enter section description"
                              />
                              
                              <Text as="h6" variant="headingSm">EMAIL FORM (Optional)</Text>
                              <Checkbox
                                label="Enable email capture"
                                checked={section.content.enableEmailCapture || false}
                                onChange={(checked) => updateSectionContent(section.id, "enableEmailCapture", checked)}
                                helpText="Show email input field in this section"
                              />
                              
                              {section.content.enableEmailCapture && (
                                <TextField
                                  label="Email placeholder"
                                  value={section.content.emailPlaceholder || ""}
                                  onChange={(value) => updateSectionContent(section.id, "emailPlaceholder", value)}
                                  placeholder="Email address"
                                />
                              )}
                              
                              <Text as="h6" variant="headingSm">PHONE FORM (Optional)</Text>
                              <Checkbox
                                label="Enable phone capture"
                                checked={section.content.enablePhoneCapture || false}
                                onChange={(checked) => updateSectionContent(section.id, "enablePhoneCapture", checked)}
                                helpText="Show phone input field in this section"
                              />
                              
                              {section.content.enablePhoneCapture && (
                                <BlockStack gap="300">
                                  <TextField
                                    label="Phone placeholder"
                                    value={section.content.phonePlaceholder || ""}
                                    onChange={(value) => updateSectionContent(section.id, "phonePlaceholder", value)}
                                    placeholder="Phone number"
                                  />
                                  <Checkbox
                                    label="Phone required"
                                    checked={section.content.phoneRequired || false}
                                    onChange={(checked) => updateSectionContent(section.id, "phoneRequired", checked)}
                                    helpText="Make phone field required for form submission"
                                  />
                                </BlockStack>
                              )}
                              
                              <Text as="h6" variant="headingSm">BUTTONS</Text>
                              {(section.content.customButtons || []).map((button: any) => (
                                <Card key={button.id}>
                                  <BlockStack gap="300">
                                    <InlineStack gap="300" align="space-between">
                                      <Text as="h6" variant="headingSm">Custom Button</Text>
                                      <Button 
                                        size="micro" 
                                        variant="plain" 
                                        onClick={() => removeSectionCustomButton(section.id, button.id)}
                                        icon={DeleteIcon}
                                      />
                                    </InlineStack>
                                    
                                    <TextField
                                      label="Button text"
                                      value={button.text}
                                      onChange={(value) => updateSectionCustomButton(section.id, button.id, "text", value)}
                                      placeholder="Button text"
                                    />
                                    
                                    <Select
                                      label="Action type"
                                      options={[
                                        { label: "Link to URL", value: "link" },
                                        { label: "Close popup", value: "close" },
                                        { label: "Custom action", value: "custom" },
                                      ]}
                                      value={button.action}
                                      onChange={(value) => updateSectionCustomButton(section.id, button.id, "action", value)}
                                    />
                                    
                                    {button.action === "link" && (
                                      <TextField
                                        label="URL"
                                        value={button.url}
                                        onChange={(value) => updateSectionCustomButton(section.id, button.id, "url", value)}
                                        placeholder="https://example.com"
                                      />
                                    )}
                                    
                                    <Select
                                      label="Button style"
                                      options={[
                                        { label: "Outline", value: "outline" },
                                        { label: "Plain", value: "plain" },
                                      ]}
                                      value={button.style}
                                      onChange={(value) => updateSectionCustomButton(section.id, button.id, "style", value)}
                                    />
                                  </BlockStack>
                                </Card>
                              ))}
                              
                              <Button 
                                size="micro" 
                                onClick={() => addSectionCustomButton(section.id)}
                                icon={PlusIcon}
                              >
                                Add custom button
                              </Button>
                              
                              <Text as="h6" variant="headingSm">FOOTER</Text>
                              <TextField
                                label="Footer text (Optional)"
                                value={section.content.footerText || ""}
                                onChange={(value) => updateSectionContent(section.id, "footerText", value)}
                                multiline={3}
                                placeholder="Text that appears at the bottom of this section"
                              />
                            </BlockStack>
                          </BlockStack>
                        </Card>
                      ))}
                      
                      {formData.isMultiStep && (
                        <Button 
                          size="micro" 
                          onClick={() => addSection("universal")}
                          icon={PlusIcon}
                        >
                          Add Section
                        </Button>
                      )}
                    </BlockStack>
                  
                  <Divider />
                  
                  <InlineStack gap="300">
                    <Button 
                      variant="primary" 
                      onClick={handleSave}
                      loading={fetcher.state === "submitting"}
                    >
                      Save changes
                    </Button>
                  </InlineStack>
                </BlockStack>
              )}

              {/* Design Tab */}
              {selectedTab === 1 && (
                <BlockStack gap="400">
                  <Text as="h4" variant="headingMd">Design Settings</Text>
                  <Text as="p" variant="bodyMd">
                    Customize the design for each section individually, or use global settings.
                  </Text>
                  
                  {/* Section Selection */}
                  <Card>
                    <BlockStack gap="300">
                      <InlineStack align="space-between">
                        <Text as="h5" variant="headingSm">Choose section to design</Text>
                        {selectedSectionForDesign && (
                          <Button 
                            size="micro" 
                            variant="secondary"
                            onClick={() => setSelectedSectionForDesign(null)}
                          >
                            Use Global Settings
                          </Button>
                        )}
                      </InlineStack>
                      
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {formData.sections.map((section: any, index: number) => (
                          <Button
                            key={section.id}
                            size="micro"
                            variant={selectedSectionForDesign === section.id ? "primary" : "secondary"}
                            onClick={() => setSelectedSectionForDesign(section.id)}
                          >
                            {section.title || `Section ${index + 1}`}
                          </Button>
                        ))}
                      </div>
                      
                      {selectedSectionForDesign && (
                        <Banner tone="info">
                          <Text as="p" variant="bodyMd">
                            You are now editing the design for: <strong>{
                              formData.sections.find((s: any) => s.id === selectedSectionForDesign)?.title || 
                              `Section ${formData.sections.findIndex((s: any) => s.id === selectedSectionForDesign) + 1}`
                            }</strong>
                          </Text>
                        </Banner>
                      )}
                      
                      {!selectedSectionForDesign && (
                        <Banner tone="warning">
                          <Text as="p" variant="bodyMd">
                            Global design mode: Changes will apply to all sections that don't have individual design settings.
                          </Text>
                        </Banner>
                      )}
                    </BlockStack>
                  </Card>
                  
                  <Divider />
                  
                  <Text as="h4" variant="headingMd">Logo</Text>
                  <Text as="p" variant="bodyMd">
                    Less than 2MB. Accepts .jpg, .png, .gif, .jpeg recommended: 620 x 400 pixels.
                  </Text>
                  
                  {(() => {
                    const currentDesign = selectedSectionForDesign 
                      ? formData.sections.find((s: any) => s.id === selectedSectionForDesign)?.design?.logoUrl || formData.logoUrl
                      : formData.logoUrl;
                    
                    if (logoUploading) {
                      return (
                        <div style={{ padding: "40px", textAlign: "center" }}>
                          <Text as="p" variant="bodyMd">Uploading logo...</Text>
                        </div>
                      );
                    }
                    
                    return currentDesign ? (
                      <BlockStack gap="200">
                        <Thumbnail
                          source={currentDesign}
                          alt="Logo"
                          size="large"
                        />
                        <Button onClick={removeLogo} size="micro">Remove logo</Button>
                      </BlockStack>
                    ) : (
                      <DropZone onDrop={handleLogoUpload} accept="image/*" type="image">
                        <DropZone.FileUpload actionTitle="Add logo" actionHint="or drop files to upload" />
                      </DropZone>
                    );
                  })()}
                  
                  <Text as="p" variant="bodySm">Logo width</Text>
                  <RangeSlider
                    label="Logo width"
                    value={getDesignFieldValue("logoWidth")}
                    onChange={(value) => updateDesignField("logoWidth", value)}
                    min={10}
                    max={100}
                    suffix="%"
                  />
                  
                  <Text as="h4" variant="headingMd">Display</Text>
                  
                  <Select
                    label="Size"
                    options={[
                      { label: "Standard", value: "standard" },
                      { label: "Large", value: "large" },
                      { label: "Small", value: "small" },
                    ]}
                    value={getDesignFieldValue("displaySize")}
                    onChange={(value) => updateDesignField("displaySize", value)}
                  />
                  
                  <Select
                    label="Alignment"
                    options={[
                      { label: "Center", value: "center" },
                      { label: "Left", value: "left" },
                      { label: "Right", value: "right" },
                    ]}
                    value={getDesignFieldValue("alignment")}
                    onChange={(value) => updateDesignField("alignment", value)}
                  />
                  
                  <Select
                    label="Corner radius"
                    options={[
                      { label: "Standard", value: "standard" },
                      { label: "Rounded", value: "rounded" },
                      { label: "Square", value: "square" },
                    ]}
                    value={getDesignFieldValue("cornerRadius")}
                    onChange={(value) => updateDesignField("cornerRadius", value)}
                  />
                  
                  <Text as="h4" variant="headingMd">Layout</Text>
                  
                  <Select
                    label="Image position"
                    options={[
                      { label: "No image", value: "none" },
                      { label: "Left", value: "left" },
                      { label: "Right", value: "right" },
                      { label: "Top", value: "top" },
                      { label: "Background", value: "background" },
                    ]}
                    value={getDesignFieldValue("imagePosition")}
                    onChange={(value) => updateDesignField("imagePosition", value)}
                  />
                  
                  <Checkbox
                    label="Hide on mobile"
                    checked={getDesignFieldValue("hideOnMobile")}
                    onChange={(checked) => updateDesignField("hideOnMobile", checked)}
                  />
                  
                  <Checkbox
                    label="Background on mobile"
                    checked={getDesignFieldValue("backgroundOnMobile")}
                    onChange={(checked) => updateDesignField("backgroundOnMobile", checked)}
                  />
                  
                  <Text as="h4" variant="headingMd">Image</Text>
                  <Text as="p" variant="bodyMd">
                    Less than 2MB. Accepts .jpg, .png, .gif, .jpeg recommended: 620 x 400 pixels.
                  </Text>
                  
                  {(() => {
                    const currentImageUrl = getDesignFieldValue("imageUrl");
                    
                    if (imageUploading) {
                      return (
                        <div style={{ padding: "40px", textAlign: "center" }}>
                          <Text as="p" variant="bodyMd">Uploading image...</Text>
                        </div>
                      );
                    }
                    
                    return currentImageUrl ? (
                      <BlockStack gap="200">
                        <Thumbnail
                          source={currentImageUrl}
                          alt="Popup image"
                          size="large"
                        />
                        <Button onClick={removeImage} size="micro">Remove image</Button>
                      </BlockStack>
                    ) : (
                      <DropZone onDrop={handleImageUpload} accept="image/*" type="image">
                        <DropZone.FileUpload actionTitle="Add image" actionHint="or drop files to upload" />
                      </DropZone>
                    );
                  })()}
                  
                  <Divider />
                  
                  <Text as="h4" variant="headingMd">Colors</Text>
                  
                  <Text as="h5" variant="headingSm">POPUP</Text>
                  <ColorPickerField
                    label="Background"
                    value={getDesignFieldValue("popupBackground")}
                    onChange={(value) => updateDesignField("popupBackground", value)}
                  />
                  
                  <Text as="h5" variant="headingSm">TEXT</Text>
                  <ColorPickerField
                    label="Heading"
                    value={getDesignFieldValue("textHeading")}
                    onChange={(value) => updateDesignField("textHeading", value)}
                  />
                  <ColorPickerField
                    label="Description"
                    value={getDesignFieldValue("textDescription")}
                    onChange={(value) => updateDesignField("textDescription", value)}
                  />
                  <ColorPickerField
                    label="Input"
                    value={getDesignFieldValue("textInput")}
                    onChange={(value) => updateDesignField("textInput", value)}
                  />
                  <ColorPickerField
                    label="Consent"
                    value={getDesignFieldValue("textConsent")}
                    onChange={(value) => updateDesignField("textConsent", value)}
                  />
                  <ColorPickerField
                    label="Error"
                    value={getDesignFieldValue("textError")}
                    onChange={(value) => updateDesignField("textError", value)}
                  />
                  <ColorPickerField
                    label="Label"
                    value={getDesignFieldValue("textLabel")}
                    onChange={(value) => updateDesignField("textLabel", value)}
                  />
                  <ColorPickerField
                    label="Footer text"
                    value={getDesignFieldValue("textFooter")}
                    onChange={(value) => updateDesignField("textFooter", value)}
                  />
                  
                  <Text as="h5" variant="headingSm">CUSTOM BUTTONS</Text>
                  
                  {/* Button Selection */}
                  <Card>
                    <BlockStack gap="300">
                      <InlineStack align="space-between">
                        <Text as="h6" variant="headingXs">Choose button to customize</Text>
                        {selectedButtonForDesign && (
                          <Button 
                            size="micro" 
                            variant="secondary"
                            onClick={() => setSelectedButtonForDesign(null)}
                          >
                            Clear Selection
                          </Button>
                        )}
                      </InlineStack>
                      
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {/* Primary Button */}
                        <Button
                          size="micro"
                          variant={selectedButtonForDesign === "primary" ? "primary" : "secondary"}
                          onClick={() => setSelectedButtonForDesign("primary")}
                        >
                          Primary Button
                        </Button>
                        
                        {/* Custom Buttons */}
                        {(() => {
                          const currentSection = selectedSectionForDesign 
                            ? formData.sections.find((s: any) => s.id === selectedSectionForDesign)
                            : formData.sections[0];
                          
                          return (currentSection?.content?.customButtons || []).map((button: any, index: number) => (
                            <Button
                              key={button.id}
                              size="micro"
                              variant={selectedButtonForDesign === `custom-${button.id}` ? "primary" : "secondary"}
                              onClick={() => setSelectedButtonForDesign(`custom-${button.id}`)}
                            >
                              {button.text || `Custom ${index + 1}`}
                            </Button>
                          ));
                        })()}
                      </div>
                      
                      {selectedButtonForDesign && (
                        <Banner tone="info">
                          <Text as="p" variant="bodyMd">
                            You are now editing: <strong>
                              {(() => {
                                if (selectedButtonForDesign === "primary") return "Primary Button";
                                const currentSection = selectedSectionForDesign 
                                  ? formData.sections.find((s: any) => s.id === selectedSectionForDesign)
                                  : formData.sections[0];
                                const customButton = (currentSection?.content?.customButtons || [])
                                  .find((btn: any) => `custom-${btn.id}` === selectedButtonForDesign);
                                return customButton?.text || "Custom Button";
                              })()}
                            </strong>
                          </Text>
                        </Banner>
                      )}
                    </BlockStack>
                  </Card>
                  
                  {/* Button-specific design controls */}
                  {selectedButtonForDesign ? (
                    <BlockStack gap="300">
                      <ColorPickerField
                        label="Background"
                        value={buttonColors[selectedButtonForDesign]?.backgroundColor || getButtonStyle(selectedButtonForDesign, "backgroundColor")}
                        onChange={(value) => updateButtonStyle(selectedButtonForDesign, "backgroundColor", value)}
                      />
                      <ColorPickerField
                        label="Text"
                        value={buttonColors[selectedButtonForDesign]?.textColor || getButtonStyle(selectedButtonForDesign, "textColor")}
                        onChange={(value) => updateButtonStyle(selectedButtonForDesign, "textColor", value)}
                      />
                      
                      {selectedButtonForDesign !== "primary" && (
                        <Select
                          label="Button style"
                          options={[
                            { label: "Filled", value: "filled" },
                            { label: "Outline", value: "outline" },
                            { label: "Plain", value: "plain" },
                          ]}
                          value={buttonColors[selectedButtonForDesign]?.style || getButtonStyle(selectedButtonForDesign, "style")}
                          onChange={(value) => updateButtonStyle(selectedButtonForDesign, "style", value)}
                        />
                      )}
                    </BlockStack>
                  ) : (
                    <Banner tone="warning">
                      <Text as="p" variant="bodyMd">
                        Select a button above to customize its design.
                      </Text>
                    </Banner>
                  )}
                  
                  
                  <Divider />
                  
                  <InlineStack gap="300">
                    <Button 
                      variant="primary" 
                      onClick={handleSave}
                      loading={fetcher.state === "submitting"}
                    >
                      Save changes
                    </Button>
                  </InlineStack>
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </div>

        {/* Preview Section */}
        <div style={{
          position: "sticky",
          top: "20px",
          height: "calc(100vh - 80px)",
          alignSelf: "start"
        }}>
          <Card style={{ height: "100%", overflow: "hidden" }}>
            <BlockStack gap="300">
              {/* Device Toggle */}
              <InlineStack align="space-between">
                <Text as="h3" variant="headingMd">Preview</Text>
                <InlineStack gap="200">
                  <Button 
                    size="micro" 
                    variant={previewDevice === 'desktop' ? 'primary' : 'secondary'}
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    Desktop
                  </Button>
                  <Button 
                    size="micro" 
                    variant={previewDevice === 'mobile' ? 'primary' : 'secondary'}
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    Mobile
                  </Button>
                </InlineStack>
              </InlineStack>

              {formData.isMultiStep && formData.sections.length > 1 && (
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodyMd">
                      Step {previewStep + 1} of {formData.sections.length}: {formData.sections[previewStep]?.title}
                    </Text>
                    <InlineStack gap="200">
                      <Button
                        size="micro"
                        onClick={prevStep}
                        disabled={previewStep === 0}
                      >
                        ← Previous
                      </Button>
                      <Button
                        size="micro"
                        onClick={nextStep}
                        disabled={previewStep === formData.sections.length - 1}
                      >
                        Next →
                      </Button>
                    </InlineStack>
                  </InlineStack>
                  
                  {/* Step indicator */}
                  <InlineStack gap="100">
                    {formData.sections.map((_, index: number) => (
                      <button
                        key={index}
                        onClick={() => goToStep(index)}
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          border: "none",
                          backgroundColor: index === previewStep ? "#000" : "#ccc",
                          cursor: "pointer"
                        }}
                      />
                    ))}
                  </InlineStack>
                </BlockStack>
              )}
              
              <Divider />
            </BlockStack>
            <Box padding="600">
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                minHeight: previewDevice === 'mobile' ? "600px" : "400px",
                backgroundColor: "#f5f5f5",
                position: "relative"
              }}>
                {/* Mobile Frame */}
                {previewDevice === 'mobile' && (
                  <div style={{
                    width: "320px",
                    height: "568px",
                    backgroundColor: "#000",
                    borderRadius: "30px",
                    padding: "20px 10px",
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
                  }}>
                    {/* Screen */}
                    <div style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "20px",
                      overflow: "auto",
                      position: "relative"
                    }}>
                      {/* Mobile Popup */}
                      <div style={{
                        backgroundColor: currentSectionDesign.popupBackground,
                        padding: currentSectionDesign.hideOnMobile ? "0" : 
                               currentSectionDesign.backgroundOnMobile ? "20px" :
                               (currentSectionDesign.imagePosition === "left" || currentSectionDesign.imagePosition === "right") ? "0" : 
                               currentSectionDesign.imagePosition === "top" ? "0 20px 20px 20px" : "20px",
                        borderRadius: currentSectionDesign.cornerRadius === "rounded" ? "12px" : 
                                    currentSectionDesign.cornerRadius === "square" ? "0px" : "8px",
                        width: currentSectionDesign.hideOnMobile ? "0" : "100%",
                        height: currentSectionDesign.hideOnMobile ? "0" : "auto",
                        visibility: currentSectionDesign.hideOnMobile ? "hidden" : "visible",
                        textAlign: currentSectionDesign.alignment as any,
                        boxShadow: currentSectionDesign.hideOnMobile ? "none" : "0 4px 16px rgba(0,0,0,0.1)",
                        position: "relative",
                        display: currentSectionDesign.hideOnMobile ? "none" : "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        backgroundImage: currentSectionDesign.imagePosition === "background" && currentSectionDesign.imageUrl ? `url(${currentSectionDesign.imageUrl})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        overflow: "hidden",
                        margin: "20px auto",
                        maxHeight: "500px"
                      }}>
                        {!currentSectionDesign.hideOnMobile && (
                          <>
                            <button style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              background: "none",
                              border: "none",
                              fontSize: "18px",
                              cursor: "pointer",
                              zIndex: 10,
                              color: currentSectionDesign.imagePosition === "background" ? "#fff" : "#000"
                            }}>×</button>
                            
                            {/* Mobile Image Top */}
                            {currentSectionDesign.imagePosition === "top" && currentSectionDesign.imageUrl && (
                              <div style={{ width: "100%" }}>
                                <img 
                                  src={currentSectionDesign.imageUrl} 
                                  alt="Popup image"
                                  style={{
                                    width: "100%",
                                    height: "120px",
                                    objectFit: "cover",
                                    borderRadius: currentSectionDesign.cornerRadius === "rounded" ? "12px 12px 0 0" : 
                                                currentSectionDesign.cornerRadius === "square" ? "0" : "8px 8px 0 0",
                                    display: "block"
                                  }}
                                />
                              </div>
                            )}
                            
                            <div style={{ 
                              width: "100%",
                              padding: currentSectionDesign.imagePosition === "top" ? "16px 20px 20px 20px" : "0"
                            }}>
                              {/* Mobile Logo */}
                              {currentSectionDesign.logoUrl && (
                                <div style={{ 
                                  marginBottom: "12px",
                                  textAlign: currentSectionDesign.alignment as any
                                }}>
                                  <img 
                                    src={currentSectionDesign.logoUrl} 
                                    alt="Logo"
                                    style={{
                                      maxWidth: `${Math.min(currentSectionDesign.logoWidth, 60)}%`,
                                      height: "auto",
                                      maxHeight: "40px"
                                    }}
                                  />
                                </div>
                              )}
                              
                              <div style={{ 
                                marginBottom: "16px",
                                position: "relative",
                                zIndex: currentSectionDesign.imagePosition === "background" ? 5 : "auto",
                                color: currentSectionDesign.imagePosition === "background" ? "#fff" : "inherit",
                                textShadow: currentSectionDesign.imagePosition === "background" ? "0 1px 2px rgba(0,0,0,0.5)" : "none"
                              }}>
                                <h2 style={{ 
                                  fontSize: "20px", 
                                  fontWeight: "600", 
                                  marginBottom: "8px",
                                  color: currentSectionDesign.imagePosition === "background" ? "#fff" : currentSectionDesign.textHeading
                                }}>
                                  {currentSection.content.heading || "Get 10% OFF your order"}
                                </h2>
                                <p style={{ 
                                  color: currentSectionDesign.imagePosition === "background" ? "#fff" : currentSectionDesign.textDescription, 
                                  marginBottom: "0",
                                  fontSize: "14px"
                                }}>
                                  {currentSection.content.description || "Sign up and unlock your instant discount."}
                                </p>
                              </div>
                            
                              <div style={{ 
                                marginBottom: "16px",
                                position: "relative",
                                zIndex: currentSectionDesign.imagePosition === "background" ? 5 : "auto"
                              }}>
                                {currentSection.content.enableEmailCapture && (
                                  <input
                                    type="email"
                                    placeholder={currentSection.content.emailPlaceholder || "Email address"}
                                    style={{
                                      width: "100%",
                                      padding: "10px",
                                      border: "1px solid #ddd",
                                      borderRadius: "6px",
                                      fontSize: "14px",
                                      marginBottom: "10px",
                                      color: currentSectionDesign.textInput,
                                      boxSizing: "border-box"
                                    }}
                                  />
                                )}
                                
                                {currentSection.content.enablePhoneCapture && (
                                  <input
                                    type="tel"
                                    placeholder={currentSection.content.phonePlaceholder || "Phone number"}
                                    required={currentSection.content.phoneRequired || false}
                                    style={{
                                      width: "100%",
                                      padding: "10px",
                                      border: "1px solid #ddd",
                                      borderRadius: "6px",
                                      fontSize: "14px",
                                      marginBottom: "10px",
                                      color: currentSectionDesign.textInput,
                                      boxSizing: "border-box"
                                    }}
                                  />
                                )}
                                
                                {/* All Buttons (Custom Buttons) */}
                                {(currentSection.content.customButtons || []).map((button: any) => {
                                  const isSelected = selectedButtonForDesign === `custom-${button.id}`;
                                  const localColors = buttonColors[`custom-${button.id}`];
                                  const buttonStyle = localColors || button.buttonStyle || { backgroundColor: currentSectionDesign.customBtnBg, textColor: currentSectionDesign.customBtnText, style: "outline" };
                                  
                                  return (
                                    <button 
                                      key={button.id}
                                      style={{
                                        backgroundColor: buttonStyle.style === "plain" ? "transparent" : buttonStyle.backgroundColor,
                                        color: buttonStyle.textColor,
                                        border: isSelected ? "2px solid #0070f3" : 
                                               buttonStyle.style === "outline" ? `1px solid ${buttonStyle.backgroundColor}` : "none",
                                        padding: "10px 20px",
                                        borderRadius: "6px",
                                        width: "100%",
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        cursor: "pointer",
                                        marginBottom: "10px",
                                        textDecoration: buttonStyle.style === "plain" ? "underline" : "none",
                                        boxShadow: isSelected ? "0 0 0 2px rgba(0, 112, 243, 0.2)" : "none"
                                      }}
                                    >
                                      {button.text}
                                    </button>
                                  );
                                })}
                              </div>
                              
                              {currentSection.content.footerText && (
                                <p style={{
                                  fontSize: "10px",
                                  color: currentSectionDesign.imagePosition === "background" ? "#fff" : currentSectionDesign.textFooter,
                                  lineHeight: "1.3",
                                  margin: "0",
                                  position: "relative",
                                  zIndex: currentSectionDesign.imagePosition === "background" ? 5 : "auto"
                                }}>
                                  {currentSection.content.footerText}
                                </p>
                              )}
                            </div>
                          </>
                        )}
                        
                        {currentSectionDesign.hideOnMobile && (
                          <div style={{ 
                            padding: "40px 20px", 
                            textAlign: "center",
                            color: "#666"
                          }}>
                            <p>Popup is hidden on mobile</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Desktop Popup */}
                {previewDevice === 'desktop' && (
                  <div style={{
                    backgroundColor: currentSectionDesign.popupBackground,
                    padding: (currentSectionDesign.imagePosition === "left" || currentSectionDesign.imagePosition === "right") ? "0" : 
                            currentSectionDesign.imagePosition === "top" ? "0 32px 32px 32px" : "32px",
                    borderRadius: currentSectionDesign.cornerRadius === "rounded" ? "12px" : 
                                currentSectionDesign.cornerRadius === "square" ? "0px" : "8px",
                    maxWidth: currentSectionDesign.displaySize === "large" ? "600px" : 
                             currentSectionDesign.displaySize === "small" ? "400px" : "500px",
                    width: "90%",
                    textAlign: currentSectionDesign.alignment as any,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    position: "relative",
                    display: "flex",
                    flexDirection: currentSectionDesign.imagePosition === "top" ? "column" : "row",
                    alignItems: currentSectionDesign.imagePosition === "left" || currentSectionDesign.imagePosition === "right" ? "stretch" : "center",
                    backgroundImage: currentSectionDesign.imagePosition === "background" && currentSectionDesign.imageUrl ? `url(${currentSectionDesign.imageUrl})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    minHeight: (currentSectionDesign.imagePosition === "left" || currentSectionDesign.imagePosition === "right") ? "400px" : "auto",
                    overflow: "hidden"
                  }}>
                    <button style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      background: "none",
                      border: "none",
                      fontSize: "20px",
                      cursor: "pointer",
                      zIndex: 10
                    }}>×</button>
                  
                  {/* Image Left */}
                  {currentSectionDesign.imagePosition === "left" && currentSectionDesign.imageUrl && (
                    <div style={{ 
                      flexShrink: 0,
                      alignSelf: "stretch"
                    }}>
                      <img 
                        src={currentSectionDesign.imageUrl} 
                        alt="Popup image"
                        style={{
                          width: "200px",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: currentSectionDesign.cornerRadius === "rounded" ? "12px 0 0 12px" : 
                                      currentSectionDesign.cornerRadius === "square" ? "0" : "8px 0 0 8px"
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Image Top - Outside content div to span full width */}
                  {currentSectionDesign.imagePosition === "top" && currentSectionDesign.imageUrl && (
                    <div style={{ 
                      order: -1,
                      width: "100%"
                    }}>
                      <img 
                        src={currentSectionDesign.imageUrl} 
                        alt="Popup image"
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: currentSectionDesign.cornerRadius === "rounded" ? "12px 12px 0 0" : 
                                      currentSectionDesign.cornerRadius === "square" ? "0" : "8px 8px 0 0",
                          display: "block"
                        }}
                      />
                    </div>
                  )}
                  
                  <div style={{ 
                    flex: 1,
                    order: currentSectionDesign.imagePosition === "right" ? 1 : 2,
                    padding: (currentSectionDesign.imagePosition === "left" || currentSectionDesign.imagePosition === "right") ? "32px" : 
                            currentSectionDesign.imagePosition === "top" ? "24px 32px 32px 32px" : "0"
                  }}>
                    
                    <div style={{ 
                      marginBottom: "24px",
                      position: "relative",
                      zIndex: currentSectionDesign.imagePosition === "background" ? 5 : "auto",
                      color: currentSectionDesign.imagePosition === "background" ? "#fff" : "inherit",
                      textShadow: currentSectionDesign.imagePosition === "background" ? "0 1px 2px rgba(0,0,0,0.5)" : "none"
                    }}>
                      <h2 style={{ 
                        fontSize: "24px", 
                        fontWeight: "600", 
                        marginBottom: "12px",
                        color: currentSectionDesign.imagePosition === "background" ? "#fff" : currentSectionDesign.textHeading
                      }}>
                        {currentSection.content.heading || "Get 10% OFF your order"}
                      </h2>
                      <p style={{ 
                        color: currentSectionDesign.imagePosition === "background" ? "#fff" : currentSectionDesign.textDescription, 
                        marginBottom: "0",
                        fontSize: "16px"
                      }}>
                        {currentSection.content.description || "Sign up and unlock your instant discount."}
                      </p>
                    </div>
                  
                    <div style={{ 
                      marginBottom: "24px",
                      position: "relative",
                      zIndex: currentSectionDesign.imagePosition === "background" ? 5 : "auto"
                    }}>
                      {currentSection.content.enableEmailCapture && (
                        <input
                          type="email"
                          placeholder={currentSection.content.emailPlaceholder || "Email address"}
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "16px",
                            marginBottom: "12px",
                            color: currentSectionDesign.textInput
                          }}
                        />
                      )}
                      
                      {currentSection.content.enablePhoneCapture && (
                        <input
                          type="tel"
                          placeholder={currentSection.content.phonePlaceholder || "Phone number"}
                          required={currentSection.content.phoneRequired || false}
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "16px",
                            marginBottom: "12px",
                            color: currentSectionDesign.textInput
                          }}
                        />
                      )}
                      
                      {/* All Buttons (Custom Buttons) */}
                      {(currentSection.content.customButtons || []).map((button: any) => {
                        const isSelected = selectedButtonForDesign === `custom-${button.id}`;
                        const localColors = buttonColors[`custom-${button.id}`];
                        const buttonStyle = localColors || button.buttonStyle || { backgroundColor: currentSectionDesign.customBtnBg, textColor: currentSectionDesign.customBtnText, style: "outline" };
                        
                        return (
                          <button 
                            key={button.id}
                            style={{
                              backgroundColor: buttonStyle.style === "plain" ? "transparent" : buttonStyle.backgroundColor,
                              color: buttonStyle.textColor,
                              border: isSelected ? "2px solid #0070f3" : 
                                     buttonStyle.style === "outline" ? `1px solid ${buttonStyle.backgroundColor}` : "none",
                              padding: "12px 24px",
                              borderRadius: "6px",
                              width: "100%",
                              fontSize: "16px",
                              fontWeight: "500",
                              cursor: "pointer",
                              marginBottom: "12px",
                              textDecoration: buttonStyle.style === "plain" ? "underline" : "none",
                              boxShadow: isSelected ? "0 0 0 2px rgba(0, 112, 243, 0.2)" : "none"
                            }}
                          >
                            {button.text}
                          </button>
                        );
                      })}
                    </div>
                    
                    {currentSection.content.footerText && (
                      <p style={{
                        fontSize: "12px",
                        color: currentSectionDesign.imagePosition === "background" ? "#fff" : currentSectionDesign.textFooter,
                        lineHeight: "1.4",
                        margin: "0",
                        position: "relative",
                        zIndex: currentSectionDesign.imagePosition === "background" ? 5 : "auto"
                      }}>
                        {currentSection.content.footerText}
                      </p>
                    )}
                  </div>
                  
                  {/* Image Right */}
                  {currentSectionDesign.imagePosition === "right" && currentSectionDesign.imageUrl && (
                    <div style={{ 
                      flexShrink: 0,
                      order: 2,
                      alignSelf: "stretch"
                    }}>
                      <img 
                        src={currentSectionDesign.imageUrl} 
                        alt="Popup image"
                        style={{
                          width: "200px",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: currentSectionDesign.cornerRadius === "rounded" ? "0 12px 12px 0" : 
                                      currentSectionDesign.cornerRadius === "square" ? "0" : "0 8px 8px 0"
                        }}
                      />
                    </div>
                  )}
                  </div>
                )}
              </div>
            </Box>
          </Card>
        </div>
      </div>
    </Page>
  );
}