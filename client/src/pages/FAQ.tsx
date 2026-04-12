import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: "1",
    question: "What is Grouperry?",
    answer: "Grouperry is a group buying coordination platform that allows users to form groups for bulk purchases, share costs, and unlock group deals. It focuses purely on coordination and does not handle payments.",
  },
  {
    id: "2",
    question: "How do I create a listing?",
    answer: "Click 'Create Listing' in the navigation menu. Fill in the details about what you're buying, set the number of slots needed, add images, and publish. You can set pricing and see savings calculations.",
  },
  {
    id: "3",
    question: "How do I join a group?",
    answer: "Browse listings, find one you're interested in, and click 'Join Group'. A confirmation dialog will appear. Once you confirm, you'll be added to the group and can start chatting with other members.",
  },
  {
    id: "4",
    question: "Can I edit my profile?",
    answer: "Yes! Go to your Profile page and click 'Edit Profile'. You can update your name, profile picture, and other details. Changes are saved immediately.",
  },
  {
    id: "5",
    question: "What is user verification?",
    answer: "Verification improves trust on the platform. You can upload your ID document and a selfie for verification. Admins will review and approve or reject your submission.",
  },
  {
    id: "6",
    question: "What's the difference between Individual and Commercial accounts?",
    answer: "Individual accounts are for personal users. Commercial accounts are for businesses/shops and allow you to list products you're selling. Choose the appropriate type when signing up.",
  },
  {
    id: "7",
    question: "Can I save listings?",
    answer: "Yes! Click the bookmark icon on any listing to save it. You can view all your saved listings in the 'Saved' section of your profile.",
  },
  {
    id: "8",
    question: "How do I leave a group?",
    answer: "On the listing details page, click 'Leave Group'. A confirmation dialog will appear to prevent accidental exits. Once confirmed, you'll be removed from the group.",
  },
  {
    id: "9",
    question: "Is there a chat feature?",
    answer: "Yes! Each group has a dedicated chat where members can discuss details, coordinate, and communicate. You can also use our AI chat widget for questions.",
  },
  {
    id: "10",
    question: "How do I report a problem?",
    answer: "If you encounter any issues with a listing or another user, use the report feature. Admins will review your report and take appropriate action.",
  },
];

export default function FAQ() {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">Find answers to common questions about Grouperry</p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => toggleExpanded(item.id)}
              data-testid={`faq-item-${item.id}`}
            >
              <div className="p-6 flex items-start justify-between gap-4">
                <h3 className="font-semibold text-lg flex-1">{item.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 mt-1 flex-shrink-0 transition-transform ${
                    expandedId === item.id ? "rotate-180" : ""
                  }`}
                />
              </div>

              {expandedId === item.id && (
                <div className="px-6 pb-6 pt-0 text-muted-foreground border-t border-border/50">
                  {item.answer}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
