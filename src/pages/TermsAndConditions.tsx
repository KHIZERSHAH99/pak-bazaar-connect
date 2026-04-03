import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Scale, FileText, AlertTriangle, Users, Package, CreditCard, Ban, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();
  const lastUpdated = 'March 11, 2026';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Scale className="h-8 w-8" />
            <h1 className="text-3xl font-bold font-poppins">Terms & Conditions</h1>
          </div>
          <p className="text-primary-foreground/80 font-poppins">
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-8 space-y-6">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <FileText className="h-5 w-5 text-primary" />
              1. Introduction & Acceptance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground font-poppins leading-relaxed">
            <p>
              Welcome to <strong className="text-foreground">PakMandi</strong> ("Platform", "we", "us", "our"). 
              By accessing, registering, or using our Platform, you ("User", "you", "your") agree to be bound by these 
              Terms and Conditions ("Terms"). If you do not agree to these Terms, you must not use our Platform.
            </p>
            <p>
              PakMandi is a B2B (Business-to-Business) wholesale marketplace operating in Pakistan that connects 
              wholesalers/manufacturers with retailers/sellers. We act solely as an intermediary platform and do not 
              directly sell, manufacture, or distribute any products listed on the Platform.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you and PakMandi. By clicking 
              "I agree to the Terms & Conditions" during registration, you confirm that you have read, understood, 
              and agree to be bound by these Terms and our Privacy Policy.
            </p>
          </CardContent>
        </Card>

        {/* Eligibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <Users className="h-5 w-5 text-primary" />
              2. Eligibility & Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground font-poppins leading-relaxed">
            <p>To use this Platform, you must:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into binding contracts under Pakistani law</li>
              <li>Be a legitimate business entity or individual operating a business in Pakistan</li>
              <li>Provide accurate, complete, and current registration information</li>
              <li>Maintain the security and confidentiality of your account credentials</li>
            </ul>
            <p>
              You are solely responsible for all activities that occur under your account. You agree to immediately 
              notify us of any unauthorized use of your account or any other breach of security.
            </p>
            <p>
              We reserve the right to refuse registration, suspend, or terminate any account at our sole discretion 
              if we reasonably believe that any information provided is inaccurate, misleading, or fraudulent.
            </p>
          </CardContent>
        </Card>

        {/* Platform Role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <Globe className="h-5 w-5 text-primary" />
              3. Platform Role & Limitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground font-poppins leading-relaxed">
            <p><strong className="text-foreground">PakMandi acts ONLY as an intermediary marketplace.</strong> We:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Do <strong>NOT</strong> own, manufacture, store, or sell any products listed on the Platform</li>
              <li>Do <strong>NOT</strong> guarantee the quality, safety, legality, or accuracy of product listings</li>
              <li>Do <strong>NOT</strong> participate in or guarantee any transaction between buyers and sellers</li>
              <li>Do <strong>NOT</strong> handle payments between buyers and sellers (all payments are directly between parties)</li>
              <li>Do <strong>NOT</strong> provide shipping, delivery, or logistics services</li>
              <li>Are <strong>NOT</strong> responsible for any disputes, damages, losses, or claims arising from transactions</li>
            </ul>
            <p>
              All transactions, negotiations, payments, shipping, and dispute resolution are solely between the 
              buyer and seller. We provide the technology platform only.
            </p>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <Shield className="h-5 w-5 text-primary" />
              4. User Responsibilities & Obligations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground font-poppins leading-relaxed">
            <div>
              <p className="font-medium text-foreground mb-2">For ALL Users:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide truthful, accurate, and up-to-date business information</li>
                <li>Comply with all applicable Pakistani federal and provincial laws and regulations</li>
                <li>Not use the Platform for any illegal, fraudulent, or unauthorized purpose</li>
                <li>Not attempt to hack, exploit, or compromise the Platform's security</li>
                <li>Not upload malicious content, viruses, or harmful code</li>
                <li>Not harass, threaten, or engage in abusive behavior toward other users</li>
                <li>Not create multiple accounts or impersonate other individuals or businesses</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">For Wholesalers/Sellers (Product Listers):</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Only list products that you legally own or are authorized to sell</li>
                <li>Provide accurate product descriptions, images, and pricing</li>
                <li>Not list prohibited, illegal, counterfeit, or restricted items under Pakistani law</li>
                <li>Fulfill orders promptly and in good faith as agreed with buyers</li>
                <li>Comply with all applicable tax regulations including Sales Tax, Income Tax, and FBR requirements</li>
                <li>Maintain valid NTN/STRN numbers as required by Pakistani law</li>
                <li>Handle customer complaints and disputes professionally</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">For Buyers/Retailers:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Verify product details and seller credentials before placing orders</li>
                <li>Make payments through agreed-upon legitimate channels</li>
                <li>Not engage in fraudulent chargebacks or false claims</li>
                <li>Provide accurate delivery information</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Prohibited Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <Ban className="h-5 w-5 text-destructive" />
              5. Prohibited Items & Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground font-poppins leading-relaxed">
            <p>The following items and activities are strictly prohibited on the Platform:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Illegal drugs, narcotics, or controlled substances</li>
              <li>Weapons, ammunition, or explosives</li>
              <li>Counterfeit or pirated goods</li>
              <li>Stolen property</li>
              <li>Products that infringe intellectual property rights (trademarks, copyrights, patents)</li>
              <li>Hazardous materials without proper licensing</li>
              <li>Items prohibited under Pakistani customs or import/export regulations</li>
              <li>Any products prohibited under the laws of Pakistan including PEMRA, PTA, or other regulatory bodies</li>
              <li>Money laundering, terrorist financing, or any activities prohibited under the Anti-Money Laundering Act 2010</li>
            </ul>
            <p className="text-destructive font-medium">
              Violation of these prohibitions will result in immediate account termination and may be reported 
              to relevant law enforcement authorities.
            </p>
          </CardContent>
        </Card>

        {/* Payments & Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <CreditCard className="h-5 w-5 text-primary" />
              6. Payments, Transactions & Disputes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground font-poppins leading-relaxed">
            <p>
              All financial transactions are conducted directly between buyers and sellers. 
              PakMandi does <strong>NOT</strong> process, hold, or manage any payments.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Payment methods (bank transfer, JazzCash, EasyPaisa, etc.) are arranged directly between parties</li>
              <li>We are not responsible for payment disputes, failed transfers, or fraudulent transactions</li>
              <li>Users must exercise due diligence before making any payments</li>
              <li>We strongly recommend using traceable payment methods and keeping records of all transactions</li>
              <li>Any disputes regarding payments, refunds, or product quality must be resolved directly between the parties</li>
            </ul>
            <p>
              While we may offer basic mediation assistance, we are under <strong>NO obligation</strong> to 
              resolve disputes between users and accept <strong>NO liability</strong> for the outcome of any dispute.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              7. Limitation of Liability & Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground font-poppins leading-relaxed">
            <p className="font-medium text-foreground">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                The Platform is provided <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> without 
                any warranties of any kind, express or implied, including but not limited to merchantability, 
                fitness for a particular purpose, or non-infringement.
              </li>
              <li>
                PakMandi shall <strong>NOT</strong> be liable for any direct, indirect, incidental, 
                special, consequential, or punitive damages arising from your use of or inability to use the Platform.
              </li>
              <li>
                We are <strong>NOT</strong> liable for any losses, damages, or claims resulting from:
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li>Transactions between users</li>
                  <li>Product quality, defects, or misrepresentation</li>
                  <li>Non-delivery or delayed delivery of products</li>
                  <li>Fraud or dishonesty by any user</li>
                  <li>Service interruptions, data loss, or technical failures</li>
                  <li>Unauthorized access to your account</li>
                  <li>Actions of third parties</li>
                </ul>
              </li>
              <li>
                In no event shall our total aggregate liability exceed the total fees paid by you to us 
                during the 12 months immediately preceding the event giving rise to such liability.
              </li>
              <li>
                Nothing in these Terms shall limit or exclude our liability for: (a) death or personal injury 
                caused by our negligence; (b) fraud or fraudulent misrepresentation; (c) gross negligence or 
                willful misconduct; or (d) any liability that cannot be excluded or limited under applicable 
                Pakistani law, including the Electronic Transactions Ordinance, 2002 and Section 74 of the 
                Contract Act, 1872.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Indemnification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <Shield className="h-5 w-5 text-primary" />
              8. Indemnification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground font-poppins leading-relaxed">
            <p>
              You agree to indemnify, defend, and hold harmless PakMandi, its owners, directors, 
              employees, agents, and affiliates from and against any and all claims, damages, obligations, 
              losses, liabilities, costs, and expenses (including attorney's fees) arising from:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your use of or access to the Platform</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any applicable law or regulation</li>
              <li>Your violation of any third-party rights, including intellectual property rights</li>
              <li>Any content you post, upload, or transmit through the Platform</li>
              <li>Any transaction or dispute between you and another user</li>
              <li>Any false, misleading, or inaccurate information you provide</li>
            </ul>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <FileText className="h-5 w-5 text-primary" />
              9. Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground font-poppins leading-relaxed">
            <p>
              The Platform, including its design, logo, text, graphics, software, and all other content 
              (excluding user-generated content), is owned by PakMandi and is protected under 
              applicable intellectual property laws of Pakistan.
            </p>
            <p>
              Users retain ownership of content they upload but grant us a non-exclusive, royalty-free, 
              worldwide license to use, display, and distribute such content solely for the purpose of 
              operating the Platform.
            </p>
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <Shield className="h-5 w-5 text-primary" />
              10. Privacy & Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground font-poppins leading-relaxed">
            <p>
              Your use of the Platform is also governed by our Privacy Policy. By using the Platform, you consent to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Collection and processing of your personal and business information as described in our Privacy Policy</li>
              <li>Use of cookies and similar tracking technologies</li>
              <li>Storage of your data on secure servers</li>
              <li>Sharing of necessary information to facilitate transactions between buyers and sellers</li>
            </ul>
            <p>
              We implement industry-standard security measures to protect your data but cannot guarantee 
              absolute security. You are responsible for maintaining the confidentiality of your account credentials.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <Ban className="h-5 w-5 text-destructive" />
              11. Account Suspension & Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground font-poppins leading-relaxed">
            <p>We reserve the right to suspend or terminate your account without prior notice if:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>You violate any provision of these Terms</li>
              <li>You engage in fraudulent, illegal, or harmful activities</li>
              <li>Your account has been inactive for an extended period</li>
              <li>We receive valid complaints or reports about your conduct</li>
              <li>Required by law or regulatory authorities</li>
            </ul>
            <p>
              You may terminate your account at any time by contacting our support team. Upon termination, 
              your right to use the Platform ceases immediately, but these Terms shall survive as applicable.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <Scale className="h-5 w-5 text-primary" />
              12. Governing Law & Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground font-poppins leading-relaxed">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the 
              Islamic Republic of Pakistan, without regard to its conflict of laws principles.
            </p>
            <p>
              Any dispute arising out of or in connection with these Terms shall be:
            </p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>First attempted to be resolved through good-faith negotiation between the parties</li>
              <li>If unresolved within 30 days, submitted to mediation</li>
              <li>If mediation fails, subject to the exclusive jurisdiction of the courts in Lahore, Pakistan</li>
            </ol>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <FileText className="h-5 w-5 text-primary" />
              13. Changes to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground font-poppins leading-relaxed">
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective immediately 
              upon posting on the Platform. Your continued use of the Platform after any changes constitutes 
              acceptance of the modified Terms.
            </p>
            <p>
              We will make reasonable efforts to notify users of significant changes through email or 
              Platform notifications.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <Users className="h-5 w-5 text-primary" />
              14. Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground font-poppins leading-relaxed">
            <p>
              For any questions, concerns, or complaints regarding these Terms, please contact us:
            </p>
            <ul className="space-y-1">
              <li><strong className="text-foreground">Platform:</strong> PakMandi</li>
              <li><strong className="text-foreground">Email:</strong> support@pakmandi.com</li>
              <li><strong className="text-foreground">Website:</strong> <Link to="/" className="text-primary hover:underline">www.pakmandi.com</Link></li>
            </ul>
          </CardContent>
        </Card>

        {/* Footer note */}
        <div className="text-center py-6">
          <p className="text-xs text-muted-foreground font-poppins">
            By using PakMandi, you acknowledge that you have read, understood, and agree to these Terms & Conditions.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
