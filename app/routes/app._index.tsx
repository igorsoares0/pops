import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData, Link } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  InlineStack,
  Badge,
  DataTable,
  EmptyState,
  Icon,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { PlusIcon, EditIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const popups = await db.popup.findMany({
    where: { shop: session.shop },
    orderBy: { updatedAt: "desc" },
  });

  return json({ popups });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "toggle") {
    const popupId = formData.get("popupId") as string;
    const isActive = formData.get("isActive") === "true";

    await db.popup.update({
      where: { id: popupId, shop: session.shop },
      data: { isActive: !isActive },
    });

    return json({ success: true });
  }

  return json({ success: false });
};

export default function Index() {
  const { popups } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  const togglePopup = (popupId: string, isActive: boolean) => {
    fetcher.submit(
      { action: "toggle", popupId, isActive: isActive.toString() },
      { method: "POST" }
    );
  };

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show("Popup updated");
    }
  }, [fetcher.data, shopify]);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(date));
  };

  const rows = popups.map((popup) => [
    <div key={popup.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ 
        width: "40px", 
        height: "30px", 
        backgroundColor: "#f0f0f0", 
        border: "1px solid #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px"
      }}>
        Preview
      </div>
      <Text as="span" variant="bodyMd">{popup.name}</Text>
    </div>,
    <div key={`date-${popup.id}`}>
      <Text as="span" variant="bodyMd">Created: {formatDate(popup.createdAt)}</Text>
      <br />
      <Text as="span" variant="bodySm" tone="subdued">Last saved: {formatDate(popup.updatedAt)}</Text>
    </div>,
    <Text key={`views-${popup.id}`} as="span" variant="bodyMd">{popup.views}</Text>,
    <Text key={`subs-${popup.id}`} as="span" variant="bodyMd">{popup.subscribers}</Text>,
    <Text key={`conv-${popup.id}`} as="span" variant="bodyMd">{popup.conversionRate}%</Text>,
    <div key={`toggle-${popup.id}`}>
      <Button
        size="micro"
        variant={popup.isActive ? "primary" : "secondary"}
        onClick={() => togglePopup(popup.id, popup.isActive)}
        loading={fetcher.state === "submitting"}
      >
        {popup.isActive ? "ON" : "OFF"}
      </Button>
    </div>,
    <div key={`actions-${popup.id}`} style={{ display: "flex", gap: "8px" }}>
      <Button
        size="micro"
        variant="secondary"
        url={`/app/popup/${popup.id}`}
      >
        Customize
      </Button>
      <Button size="micro" variant="plain">⋯</Button>
    </div>
  ]);

  return (
    <Page>
      <TitleBar title="Popups">
        <Link to="/app/popup/new">
          <Button variant="primary" icon={PlusIcon}>
            Create popup
          </Button>
        </Link>
      </TitleBar>

      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    Popup library
                  </Text>
                  <Link to="/app/popup/new">
                    <Button variant="primary" icon={PlusIcon}>
                      New popup
                    </Button>
                  </Link>
                </InlineStack>
                
                {popups.length === 0 ? (
                  <EmptyState
                    heading="Create your first popup"
                    action={{
                      content: "Create popup",
                      url: "/app/popup/new",
                    }}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <Text as="p" variant="bodyMd">
                      Start collecting emails and increasing conversions with beautiful popups.
                    </Text>
                  </EmptyState>
                ) : (
                  <DataTable
                    columnContentTypes={[
                      "text",
                      "text", 
                      "numeric",
                      "numeric", 
                      "numeric",
                      "text",
                      "text"
                    ]}
                    headings={[
                      "Popup",
                      "Dates", 
                      "Popup views",
                      "Subscribers",
                      "Conversion rate",
                      "Status",
                      "Actions"
                    ]}
                    rows={rows}
                    footerContent={`Showing ${popups.length} popup${popups.length !== 1 ? 's' : ''}`}
                  />
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {popups.length > 0 && (
          <Layout>
            <Layout.Section>
              <Card>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" alignment="center">
                    Learn more about{" "}
                    <Link 
                      url="https://channelwill.com" 
                      target="_blank"
                      removeUnderline
                    >
                      Channelwill
                    </Link>
                  </Text>
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        )}
      </BlockStack>
    </Page>
  );
}
