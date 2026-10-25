(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PlatformGuide = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const caps = Object.freeze({ adult: 50, concession: 25, checked: '19 October 2026' });
  const profiles = ['domestic-full', 'disability', 'domestic-other', 'scholarship', 'international-other', 'unsure'];
  function compareCaps(weeks) {
    if (!Number.isInteger(weeks) || weeks < 1 || weeks > 52) throw new RangeError('Choose a whole number of weeks between 1 and 52.');
    return { weeks, adult: caps.adult * weeks, concession: caps.concession * weeks, difference: (caps.adult - caps.concession) * weeks };
  }
  function getPathway({ residence, course, profile }) {
    if (![residence, course].every(v => ['yes', 'no', 'unsure'].includes(v)) || !profiles.includes(profile)) throw new TypeError('Complete all three questions.');
    if (residence === 'no' || course === 'no') return {
      id: 'outside-pathway',
      title: 'This student pathway may not apply',
      summary: 'Your answers do not match the standard NSW tertiary residence or participating-course conditions. This result covers only the tertiary scheme.',
      steps: ['Ask your institution to confirm your course and NSW residence status, including any special provisions.', 'Check other concession categories with Transport for NSW. Do not assume that being a student is enough to claim this concession.', 'For travel now, confirm the correct fare category with the operator.']
    };
    if (residence === 'unsure' || course === 'unsure' || profile === 'unsure') return {
      id: 'clarify',
      title: 'One detail needs checking first',
      summary: 'A reliable answer depends on the details you are unsure about. Your institution can check your residence, course, enrolment and funding against the scheme.',
      steps: ['Ask your student centre whether your accredited course and institution participate in the NSW tertiary scheme.', 'Check the relevant residence and enrolment conditions in the official guidance.', 'If you have a scholarship, take its full funding terms to the institution for an individual check.']
    };
    const pathways = {
      'domestic-full': {
        id: 'standard', title: 'Your answers match the usual student pathway',
        summary: 'NSW residence, citizenship or permanent residence, and full time on campus study match the standard criteria. Your institution still needs to validate your eligibility.',
        steps: ['Confirm your enrolment with your institution and complete its required consent and scheme terms.', 'Follow the official application process for a Concession Opal card or linked contactless payment. UTS students can find the consent step in My Student Admin.', 'Carry accepted proof of entitlement and use the same payment card or device to tap on and off.']
      },
      disability: {
        id: 'disability', title: 'Ask about the disability exemption',
        summary: 'The guidelines allow an exemption from full time or internal study requirements where disability prevents those study arrangements. Other eligibility conditions still apply.',
        steps: ['Contact your institution’s disability or accessibility service for an assessment and certification.', 'Ask the institution to validate the remaining conditions and complete the necessary consent and scheme terms.', 'Wait for confirmation of entitlement before applying or travelling on this concession.']
      },
      'domestic-other': {
        id: 'study-arrangements', title: 'Check the study requirement with your institution',
        summary: 'Full time internal study is part of the standard pathway. Other arrangements need an individual check, including any applicable disability or course provisions.',
        steps: ['Ask your institution how it classifies your study load and attendance.', 'If disability prevents full time or internal study, ask the accessibility service about certification.', 'Check other concession categories if this tertiary pathway does not fit.']
      },
      scholarship: {
        id: 'scholarship', title: 'Your scholarship needs an individual check',
        summary: 'Approved, fully funded Australian Government scholarship or exchange arrangements can create a pathway for international students. The award name alone does not confirm entitlement.',
        steps: ['Take the full scholarship or exchange funding terms to your institution.', 'Ask it to check section 9 of the May 2026 TfNSW guidelines, including full funding, entry standards and supplementary funding exclusions, as well as the other relevant criteria.', 'Complete consent and payment setup only after your institution confirms entitlement.']
      },
      'international-other': {
        id: 'international', title: 'This tertiary concession is generally unavailable',
        summary: 'International students on temporary visas with other funding generally fall outside this tertiary pathway. A university fee discount alone does not establish an approved government scholarship entitlement.',
        steps: ['Budget using the adult fare category unless another entitlement applies and has been confirmed.', 'Ask your institution to check any unusual funding arrangement or other relevant concession.', 'Adult fares still have travel caps and applicable discounts. Use the TfNSW trip planner for your own journey.']
      }
    };
    return pathways[profile];
  }
  return Object.freeze({ caps, compareCaps, getPathway });
});
