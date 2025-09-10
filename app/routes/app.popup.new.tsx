import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useNavigation, Form } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  TextField,
  BlockStack,
  InlineStack,
  Text,
  Banner,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const name = formData.get("name") as string;

  if (!name?.trim()) {
    return json({ error: "Popup name is required" }, { status: 400 });
  }

  try {
    // Create default custom buttons for new popup
    const defaultButtons = [
      {
        id: "default",
        text: "Join Now",
        action: "close_popup",
        style: "outline"
      }
    ];

    const popup = await db.popup.create({
      data: {
        shop: session.shop,
        name: name.trim(),
        heading: "Get 10% OFF your order",
        description: "Sign up and unlock your instant discount.",
        emailPlaceholder: "Email address",
        customButtons: JSON.stringify(defaultButtons),
        footerText: "You are signing up to receive communication via email and can unsubscribe at any time.",
        discountType: "percentage",
        discountValue: 10,
        enablePhoneField: false,
        phoneRequired: false,
        phonePlaceholder: "Phone number",
      },
    });

    return redirect(`/app/popup/${popup.id}`);
  } catch (error) {
    console.error("Error creating popup:", error);
    return json({ error: "Failed to create popup" }, { status: 500 });
  }
};

export default function NewPopup() {
  const [name, setName] = useState("");
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Page>
      <TitleBar title="Create new popup" />
      
      <Form method="post">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Popup settings
                </Text>
                
                {actionData?.error && (
                  <Banner tone="critical">
                    <Text as="p">{actionData.error}</Text>
                  </Banner>
                )}
                
                <TextField
                  label="Popup name"
                  name="name"
                  value={name}
                  onChange={setName}
                  placeholder="Opt-in popup"
                  helpText="Only visible to you, not shown to customers."
                  autoComplete="off"
                  maxLength={50}
                />
                
                <InlineStack gap="300">
                  <Button
                    variant="primary"
                    submit
                    loading={isSubmitting}
                  >
                    Create popup
                  </Button>
                  <Button
                    variant="secondary"
                    url="/app"
                  >
                    Cancel
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Form>
    </Page>
  );
}