import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card bg-base-100">
          <div className="card-body">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold mt-6">1. Information We Collect</h2>
              <p>
                We collect information that you provide directly to us, including when you create
                an account, make a purchase, or contact us for support. This may include:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Name and contact information</li>
                <li>Account credentials</li>
                <li>Payment information</li>
                <li>Gaming preferences and history</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-6">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Provide and maintain our services</li>
                <li>Process your transactions</li>
                <li>Send you important updates and notifications</li>
                <li>Improve our services and user experience</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-6">3. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to maintain the
                security of your personal information, including encryption of sensitive data
                and regular security assessments.
              </p>

              <h2 className="text-2xl font-semibold mt-6">4. Your Rights</h2>
              <p>
                You have the right to:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-6">5. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                <a href="mailto:privacy@solwin.com" className="link link-primary">
                  privacy@solwin.com
                </a>
              </p>
            </div>

            <div className="mt-8 flex justify-end">
              <button className="btn btn-primary">I Understand</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage; 