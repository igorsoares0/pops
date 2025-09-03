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
  RangeSlider,
  FormLayout,
  Banner,
  Divider,
  DropZone,
  Thumbnail,
} from "@shopify/polaris";
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
  
  // Rules tab
  const discountType = formData.get("discountType") as string;
  if (discountType) updateData.discountType = discountType;
  
  const discountValue = formData.get("discountValue") as string;
  if (discountValue) updateData.discountValue = parseFloat(discountValue);
  
  const discountCode = formData.get("discountCode") as string;
  if (discountCode !== null) updateData.discountCode = discountCode;
  
  const autoGenerateCode = formData.get("autoGenerateCode");
  if (autoGenerateCode !== null) updateData.autoGenerateCode = autoGenerateCode === "true";
  
  const hasExpiration = formData.get("hasExpiration");
  if (hasExpiration !== null) updateData.hasExpiration = hasExpiration === "true";
  
  const enterShopifyCode = formData.get("enterShopifyCode");
  if (enterShopifyCode !== null) updateData.enterShopifyCode = enterShopifyCode === "true";
  
  const showStickyBar = formData.get("showStickyBar");
  if (showStickyBar !== null) updateData.showStickyBar = showStickyBar === "true";
  
  const sidebarWidget = formData.get("sidebarWidget");
  if (sidebarWidget !== null) updateData.sidebarWidget = sidebarWidget === "true";

  // Content tab
  const heading = formData.get("heading") as string;
  if (heading !== null) updateData.heading = heading;
  
  const description = formData.get("description") as string;
  if (description !== null) updateData.description = description;
  
  const emailPlaceholder = formData.get("emailPlaceholder") as string;
  if (emailPlaceholder !== null) updateData.emailPlaceholder = emailPlaceholder;
  
  const primaryButton = formData.get("primaryButton") as string;
  if (primaryButton !== null) updateData.primaryButton = primaryButton;
  
  const secondaryButton = formData.get("secondaryButton") as string;
  if (secondaryButton !== null) updateData.secondaryButton = secondaryButton;
  
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
  
  const stickyBarBg = formData.get("stickyBarBg") as string;
  if (stickyBarBg !== null) updateData.stickyBarBg = stickyBarBg;
  
  const stickyBarText = formData.get("stickyBarText") as string;
  if (stickyBarText !== null) updateData.stickyBarText = stickyBarText;
  
  const sidebarBg = formData.get("sidebarBg") as string;
  if (sidebarBg !== null) updateData.sidebarBg = sidebarBg;
  
  const sidebarText = formData.get("sidebarText") as string;
  if (sidebarText !== null) updateData.sidebarText = sidebarText;

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
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    // Rules
    discountType: popup.discountType || "percentage",
    discountValue: popup.discountValue || 10,
    discountCode: popup.discountCode || "",
    autoGenerateCode: popup.autoGenerateCode,
    hasExpiration: popup.hasExpiration,
    enterShopifyCode: popup.enterShopifyCode,
    showStickyBar: popup.showStickyBar,
    sidebarWidget: popup.sidebarWidget,
    
    // Content
    heading: popup.heading || "",
    description: popup.description || "",
    emailPlaceholder: popup.emailPlaceholder || "",
    primaryButton: popup.primaryButton || "",
    secondaryButton: popup.secondaryButton || "",
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
    stickyBarBg: popup.stickyBarBg || "#FFFFFF",
    stickyBarText: popup.stickyBarText || "#000000",
    sidebarBg: popup.sidebarBg || "#000000",
    sidebarText: popup.sidebarText || "#FFFFFF",
  });

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show("Popup saved successfully");
    } else if (fetcher.data?.error) {
      shopify.toast.show(fetcher.data.error, { isError: true });
    }
  }, [fetcher.data, shopify]);

  const handleSave = () => {
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value.toString());
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

  const handleLogoUpload = (files: File[]) => {
    setLogoFiles(files);
    if (files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      updateFormData("logoUrl", url);
    }
  };

  const handleImageUpload = (files: File[]) => {
    setImageFiles(files);
    if (files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      updateFormData("imageUrl", url);
    }
  };

  const removeLogo = () => {
    setLogoFiles([]);
    updateFormData("logoUrl", "");
  };

  const removeImage = () => {
    setImageFiles([]);
    updateFormData("imageUrl", "");
  };

  const tabs = [
    { id: "rules", content: "Rules" },
    { id: "content", content: "Content" },
    { id: "style", content: "Style" },
  ];

  return (
    <Page>
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

      <Layout>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">Opt in popup</Text>
              
              <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={setSelectedTab}
              />
              
              {/* Rules Tab */}
              {selectedTab === 0 && (
                <BlockStack gap="400">
                  <Text as="h4" variant="headingMd">Discount coupon</Text>
                  <Text as="p" variant="bodyMd">
                    Attract customers to subscribe with a discount code.
                  </Text>
                  
                  <Checkbox
                    label="No discount"
                    checked={formData.discountType === "none"}
                    onChange={(checked) => 
                      updateFormData("discountType", checked ? "none" : "percentage")
                    }
                  />
                  
                  {formData.discountType !== "none" && (
                    <BlockStack gap="400">
                      <Checkbox
                        label="Discount code"
                        checked={true}
                      />
                      
                      <Checkbox
                        label="Auto-generate a unique and non-reusable code for each subscription."
                        checked={formData.autoGenerateCode}
                        onChange={(checked) => updateFormData("autoGenerateCode", checked)}
                      />
                      
                      <Select
                        label="Select type"
                        options={[
                          { label: "Percentage off", value: "percentage" },
                          { label: "Fixed amount off", value: "fixed" },
                        ]}
                        value={formData.discountType}
                        onChange={(value) => updateFormData("discountType", value)}
                      />
                      
                      <TextField
                        label="Value"
                        type="number"
                        value={formData.discountValue.toString()}
                        onChange={(value) => updateFormData("discountValue", parseFloat(value) || 0)}
                        suffix={formData.discountType === "percentage" ? "%" : ""}
                      />
                      
                      <Checkbox
                        label="Set expiration on discount"
                        checked={formData.hasExpiration}
                        onChange={(checked) => updateFormData("hasExpiration", checked)}
                      />
                      
                      <Checkbox
                        label="Enter Shopify discount manually"
                        checked={formData.enterShopifyCode}
                        onChange={(checked) => updateFormData("enterShopifyCode", checked)}
                      />
                    </BlockStack>
                  )}
                  
                  <Divider />
                  
                  <Text as="h4" variant="headingMd">Sticky discount bar</Text>
                  <Text as="p" variant="bodyMd">
                    Display a sticky discount bar at the top of your website after a successful subscription.
                  </Text>
                  
                  <Checkbox
                    label="Show"
                    checked={formData.showStickyBar}
                    onChange={(checked) => updateFormData("showStickyBar", checked)}
                  />
                  
                  <Checkbox
                    label="Don't show"
                    checked={!formData.showStickyBar}
                    onChange={(checked) => updateFormData("showStickyBar", !checked)}
                  />
                  
                  <Divider />
                  
                  <Text as="h4" variant="headingMd">Sidebar widget</Text>
                  <Text as="p" variant="bodyMd">
                    Display a sidebar widget if the customer declines the popup without subscribing.
                  </Text>
                  
                  <Checkbox
                    label="Show"
                    checked={formData.sidebarWidget}
                    onChange={(checked) => updateFormData("sidebarWidget", checked)}
                  />
                  
                  <Checkbox
                    label="Don't show"
                    checked={!formData.sidebarWidget}
                    onChange={(checked) => updateFormData("sidebarWidget", !checked)}
                  />
                  
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

              {/* Content Tab */}
              {selectedTab === 1 && (
                <BlockStack gap="400">
                  <Text as="h4" variant="headingMd">Start status</Text>
                  
                  <Text as="h5" variant="headingSm">POPUP CONTENT</Text>
                  
                  <TextField
                    label="Heading"
                    value={formData.heading}
                    onChange={(value) => updateFormData("heading", value)}
                    maxLength={50}
                  />
                  
                  <TextField
                    label="Description"
                    value={formData.description}
                    onChange={(value) => updateFormData("description", value)}
                    multiline={4}
                  />
                  
                  <Text as="h5" variant="headingSm">FORM</Text>
                  
                  <TextField
                    label="Name"
                    value="Name"
                    disabled
                  />
                  
                  <TextField
                    label="Email address"
                    value={formData.emailPlaceholder}
                    onChange={(value) => updateFormData("emailPlaceholder", value)}
                  />
                  
                  <Button size="micro">Add form field</Button>
                  
                  <Text as="h5" variant="headingSm">ACTIONS</Text>
                  
                  <TextField
                    label="Primary button"
                    value={formData.primaryButton}
                    onChange={(value) => updateFormData("primaryButton", value)}
                  />
                  
                  <TextField
                    label="Secondary button"
                    value={formData.secondaryButton}
                    onChange={(value) => updateFormData("secondaryButton", value)}
                  />
                  
                  <Text as="h5" variant="headingSm">FOOTER</Text>
                  
                  <TextField
                    label="Footer text"
                    value={formData.footerText}
                    onChange={(value) => updateFormData("footerText", value)}
                    multiline={3}
                  />
                  
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

              {/* Style Tab */}
              {selectedTab === 2 && (
                <BlockStack gap="400">
                  <Text as="h4" variant="headingMd">Logo</Text>
                  <Text as="p" variant="bodyMd">
                    Less than 2MB. Accepts .jpg, .png, .gif, .jpeg recommended: 620 x 400 pixels.
                  </Text>
                  
                  {formData.logoUrl ? (
                    <BlockStack gap="200">
                      <Thumbnail
                        source={formData.logoUrl}
                        alt="Logo"
                        size="large"
                      />
                      <Button onClick={removeLogo} size="micro">Remove logo</Button>
                    </BlockStack>
                  ) : (
                    <DropZone onDrop={handleLogoUpload} accept="image/*" type="image">
                      <DropZone.FileUpload actionTitle="Add logo" actionHint="or drop files to upload" />
                    </DropZone>
                  )}
                  
                  <Text as="p" variant="bodySm">Logo width</Text>
                  <RangeSlider
                    label="Logo width"
                    value={formData.logoWidth}
                    onChange={(value) => updateFormData("logoWidth", value)}
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
                    value={formData.displaySize}
                    onChange={(value) => updateFormData("displaySize", value)}
                  />
                  
                  <Select
                    label="Alignment"
                    options={[
                      { label: "Center", value: "center" },
                      { label: "Left", value: "left" },
                      { label: "Right", value: "right" },
                    ]}
                    value={formData.alignment}
                    onChange={(value) => updateFormData("alignment", value)}
                  />
                  
                  <Select
                    label="Corner radius"
                    options={[
                      { label: "Standard", value: "standard" },
                      { label: "Rounded", value: "rounded" },
                      { label: "Square", value: "square" },
                    ]}
                    value={formData.cornerRadius}
                    onChange={(value) => updateFormData("cornerRadius", value)}
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
                    value={formData.imagePosition}
                    onChange={(value) => updateFormData("imagePosition", value)}
                  />
                  
                  <Checkbox
                    label="Hide on mobile"
                    checked={formData.hideOnMobile}
                    onChange={(checked) => updateFormData("hideOnMobile", checked)}
                  />
                  
                  <Checkbox
                    label="Background on mobile"
                    checked={formData.backgroundOnMobile}
                    onChange={(checked) => updateFormData("backgroundOnMobile", checked)}
                  />
                  
                  <Text as="h4" variant="headingMd">Image</Text>
                  <Text as="p" variant="bodyMd">
                    Less than 2MB. Accepts .jpg, .png, .gif, .jpeg recommended: 620 x 400 pixels.
                  </Text>
                  
                  {formData.imageUrl ? (
                    <BlockStack gap="200">
                      <Thumbnail
                        source={formData.imageUrl}
                        alt="Popup image"
                        size="large"
                      />
                      <Button onClick={removeImage} size="micro">Remove image</Button>
                    </BlockStack>
                  ) : (
                    <DropZone onDrop={handleImageUpload} accept="image/*" type="image">
                      <DropZone.FileUpload actionTitle="Add image" actionHint="or drop files to upload" />
                    </DropZone>
                  )}
                  
                  <Divider />
                  
                  <Text as="h4" variant="headingMd">Colors</Text>
                  
                  <Text as="h5" variant="headingSm">POPUP</Text>
                  <ColorPickerField
                    label="Background"
                    value={formData.popupBackground}
                    onChange={(value) => updateFormData("popupBackground", value)}
                  />
                  
                  <Text as="h5" variant="headingSm">TEXT</Text>
                  <ColorPickerField
                    label="Heading"
                    value={formData.textHeading}
                    onChange={(value) => updateFormData("textHeading", value)}
                  />
                  <ColorPickerField
                    label="Description"
                    value={formData.textDescription}
                    onChange={(value) => updateFormData("textDescription", value)}
                  />
                  <ColorPickerField
                    label="Input"
                    value={formData.textInput}
                    onChange={(value) => updateFormData("textInput", value)}
                  />
                  <ColorPickerField
                    label="Consent"
                    value={formData.textConsent}
                    onChange={(value) => updateFormData("textConsent", value)}
                  />
                  <ColorPickerField
                    label="Error"
                    value={formData.textError}
                    onChange={(value) => updateFormData("textError", value)}
                  />
                  <ColorPickerField
                    label="Label"
                    value={formData.textLabel}
                    onChange={(value) => updateFormData("textLabel", value)}
                  />
                  <ColorPickerField
                    label="Footer text"
                    value={formData.textFooter}
                    onChange={(value) => updateFormData("textFooter", value)}
                  />
                  
                  <Text as="h5" variant="headingSm">PRIMARY BUTTON</Text>
                  <ColorPickerField
                    label="Background"
                    value={formData.primaryBtnBg}
                    onChange={(value) => updateFormData("primaryBtnBg", value)}
                  />
                  <ColorPickerField
                    label="Text"
                    value={formData.primaryBtnText}
                    onChange={(value) => updateFormData("primaryBtnText", value)}
                  />
                  
                  <Text as="h5" variant="headingSm">SECONDARY BUTTON</Text>
                  <ColorPickerField
                    label="Text"
                    value={formData.secondaryBtnText}
                    onChange={(value) => updateFormData("secondaryBtnText", value)}
                  />
                  
                  <Text as="h5" variant="headingSm">Sticky discount bar</Text>
                  <ColorPickerField
                    label="Background"
                    value={formData.stickyBarBg}
                    onChange={(value) => updateFormData("stickyBarBg", value)}
                  />
                  <ColorPickerField
                    label="Text"
                    value={formData.stickyBarText}
                    onChange={(value) => updateFormData("stickyBarText", value)}
                  />
                  
                  <Text as="h5" variant="headingSm">Sidebar widget</Text>
                  <ColorPickerField
                    label="Background"
                    value={formData.sidebarBg}
                    onChange={(value) => updateFormData("sidebarBg", value)}
                  />
                  <ColorPickerField
                    label="Text"
                    value={formData.sidebarText}
                    onChange={(value) => updateFormData("sidebarText", value)}
                  />
                  
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
        </Layout.Section>

        {/* Preview Section */}
        <Layout.Section>
          <Card>
            <Box padding="600">
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                minHeight: "400px",
                backgroundColor: "#f5f5f5",
                position: "relative"
              }}>
                <div style={{
                  backgroundColor: formData.popupBackground,
                  padding: "32px",
                  borderRadius: formData.cornerRadius === "rounded" ? "12px" : 
                              formData.cornerRadius === "square" ? "0px" : "8px",
                  maxWidth: formData.displaySize === "large" ? "600px" : 
                           formData.displaySize === "small" ? "400px" : "500px",
                  width: "90%",
                  textAlign: formData.alignment as any,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  position: "relative",
                  display: "flex",
                  flexDirection: formData.imagePosition === "top" ? "column" : "row",
                  alignItems: formData.imagePosition === "left" || formData.imagePosition === "right" ? "flex-start" : "center",
                  backgroundImage: formData.imagePosition === "background" && formData.imageUrl ? `url(${formData.imageUrl})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat"
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
                  {formData.imagePosition === "left" && formData.imageUrl && (
                    <div style={{ 
                      marginRight: "24px",
                      flexShrink: 0
                    }}>
                      <img 
                        src={formData.imageUrl} 
                        alt="Popup image"
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "8px"
                        }}
                      />
                    </div>
                  )}
                  
                  <div style={{ 
                    flex: 1,
                    order: formData.imagePosition === "right" ? 1 : 2
                  }}>
                    {/* Logo */}
                    {formData.logoUrl && (
                      <div style={{ 
                        marginBottom: "16px",
                        textAlign: formData.alignment as any
                      }}>
                        <img 
                          src={formData.logoUrl} 
                          alt="Logo"
                          style={{
                            maxWidth: `${formData.logoWidth}%`,
                            height: "auto",
                            maxHeight: "60px"
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Image Top */}
                    {formData.imagePosition === "top" && formData.imageUrl && (
                      <div style={{ marginBottom: "24px" }}>
                        <img 
                          src={formData.imageUrl} 
                          alt="Popup image"
                          style={{
                            width: "100%",
                            maxHeight: "150px",
                            objectFit: "cover",
                            borderRadius: "8px"
                          }}
                        />
                      </div>
                    )}
                    
                    <div style={{ 
                      marginBottom: "24px",
                      position: "relative",
                      zIndex: formData.imagePosition === "background" ? 5 : "auto",
                      color: formData.imagePosition === "background" ? "#fff" : "inherit",
                      textShadow: formData.imagePosition === "background" ? "0 1px 2px rgba(0,0,0,0.5)" : "none"
                    }}>
                      <h2 style={{ 
                        fontSize: "24px", 
                        fontWeight: "600", 
                        marginBottom: "12px",
                        color: formData.imagePosition === "background" ? "#fff" : formData.textHeading
                      }}>
                        {formData.heading || "Get 10% OFF your order"}
                      </h2>
                      <p style={{ 
                        color: formData.imagePosition === "background" ? "#fff" : formData.textDescription, 
                        marginBottom: "0",
                        fontSize: "16px"
                      }}>
                        {formData.description || "Sign up and unlock your instant discount."}
                      </p>
                    </div>
                  
                    <div style={{ 
                      marginBottom: "24px",
                      position: "relative",
                      zIndex: formData.imagePosition === "background" ? 5 : "auto"
                    }}>
                      <input
                        type="email"
                        placeholder={formData.emailPlaceholder || "Email address"}
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          fontSize: "16px",
                          marginBottom: "12px",
                          color: formData.textInput
                        }}
                      />
                      
                      <button style={{
                        backgroundColor: formData.primaryBtnBg,
                        color: formData.primaryBtnText,
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: "6px",
                        width: "100%",
                        fontSize: "16px",
                        fontWeight: "500",
                        cursor: "pointer",
                        marginBottom: "12px"
                      }}>
                        {formData.primaryButton || "Claim discount"}
                      </button>
                      
                      <button style={{
                        background: "none",
                        border: "none",
                        color: formData.imagePosition === "background" ? "#fff" : formData.secondaryBtnText,
                        fontSize: "14px",
                        cursor: "pointer",
                        textDecoration: "underline"
                      }}>
                        {formData.secondaryButton || "No, thanks"}
                      </button>
                    </div>
                    
                    <p style={{
                      fontSize: "12px",
                      color: formData.imagePosition === "background" ? "#fff" : formData.textFooter,
                      lineHeight: "1.4",
                      margin: "0",
                      position: "relative",
                      zIndex: formData.imagePosition === "background" ? 5 : "auto"
                    }}>
                      {formData.footerText || "You are signing up to receive communication via email and can unsubscribe at any time."}
                    </p>
                  </div>
                  
                  {/* Image Right */}
                  {formData.imagePosition === "right" && formData.imageUrl && (
                    <div style={{ 
                      marginLeft: "24px",
                      flexShrink: 0,
                      order: 2
                    }}>
                      <img 
                        src={formData.imageUrl} 
                        alt="Popup image"
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "8px"
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}