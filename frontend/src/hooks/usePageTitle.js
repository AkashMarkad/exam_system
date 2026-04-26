import { useEffect } from 'react';

const APP_NAME = 'ExamSystem';

/**
 * Sets the browser tab title.
 * @param {string} pageTitle - e.g. "Home" → produces "ExamSystem | Home"
 *                             Pass null/undefined for the root landing title.
 */
function usePageTitle(pageTitle) {
    useEffect(() => {
        document.title = pageTitle
            ? `${APP_NAME} | ${pageTitle}`
            : `${APP_NAME} — Smart Assessment Platform`;
    }, [pageTitle]);
}

export default usePageTitle;
