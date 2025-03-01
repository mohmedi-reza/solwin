import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card bg-base-100 ">
          <div className="card-body">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold mt-6">1. Acceptance of Terms</h2>
              <p>
                By accessing and using this website, you accept and agree to be bound by the terms
                and provision of this agreement.
              </p>

              <h2 className="text-2xl font-semibold mt-6">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information
                or software) on Solwin's website for personal, non-commercial transitory viewing only.
              </p>

              <h2 className="text-2xl font-semibold mt-6">3. Disclaimer</h2>
              <p>
                The materials on Solwin's website are provided on an 'as is' basis. Solwin makes no
                warranties, expressed or implied, and hereby disclaims and negates all other warranties
                including, without limitation, implied warranties or conditions of merchantability,
                fitness for a particular purpose, or non-infringement of intellectual property or
                other violation of rights.
              </p>

              <h2 className="text-2xl font-semibold mt-6">4. Limitations</h2>
              <p>
                In no event shall Solwin or its suppliers be liable for any damages (including,
                without limitation, damages for loss of data or profit, or due to business
                interruption) arising out of the use or inability to use the materials on Solwin's
                website.
              </p>

              <h2 className="text-2xl font-semibold mt-6">5. Revisions and Errata</h2>
              <p>
                The materials appearing on Solwin's website could include technical, typographical,
                or photographic errors. Solwin does not warrant that any of the materials on its
                website are accurate, complete or current.
              </p>
            </div>

            <div className="mt-8 flex justify-end">
              <button className="btn btn-primary">I Accept</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage; 