/* ============================================================
   PADDLE CREEK PAINTS — analyticsConfig.js

   ── THE TWO THINGS TO FILL IN ──────────────────────────────

   Paste real IDs below once they exist:

       ga4MeasurementId   Google Analytics 4 property, e.g. 'G-XXXXXXXXXX'
       clarityProjectId   Microsoft Clarity project, e.g. 'abcd1234ef'

   Until BOTH conditions below are met, nothing loads:
       - the id for that service is a non-empty string, AND
       - it does not still read as a placeholder

   No fake or placeholder ID is ever sent to Google or Microsoft, and no
   script tag is inserted at all when a service is unconfigured — there is
   nothing left running to forget about. This mirrors the /exec URL pattern
   in js/siteJS.js: one obvious place to paste a real value, honest and
   inert until it is.

   1. Configuration
   2. Loader
   3. Initialization
============================================================ */


/* ============================================================
   CONFIGURATION
============================================================ */

const paddleCreekAnalyticsConfig = {

    /* Google Analytics 4 Measurement ID. */

    ga4MeasurementId: 'G-FNGDL0KQQP',

    /* Microsoft Clarity Project ID. */

    clarityProjectId: 'yeaeooedgi'

};


/* ============================================================
   LOADER
============================================================ */

function isConfiguredId(value)
{

    return typeof value === 'string' && value.trim().length > 0;

}

/**
 * Loads the official GA4 gtag.js snippet, exactly as Google documents it,
 * only when a real Measurement ID has been supplied.
 */
function loadGoogleAnalytics(measurementId)
{

    if (!isConfiguredId(measurementId))
    {

        return;

    }

    const gtagScript = document.createElement('script');

    gtagScript.async = true;

    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);

    document.head.appendChild(gtagScript);

    window.dataLayer = window.dataLayer || [];

    /* Attached to window (not just this closure) so trackConversionEvent
       below — called later, from siteJS.js, after a funnel actually
       succeeds — has something to call. Never created when GA4 is
       unconfigured. */

    window.gtag = window.gtag || function ()
    {

        window.dataLayer.push(arguments);

    };

    window.gtag('js', new Date());

    window.gtag('config', measurementId);

}


/**
 * The one integration point the two backend funnels call after a real,
 * server-confirmed success — never on form display, never on a failed or
 * unconfigured submission. Fires a bare named event with no event
 * parameters, so there is no PII (email, name, commission text) for this
 * function to leak even by mistake. A no-op, safely, whenever GA4 is
 * unconfigured or has not finished loading.
 */
function trackConversionEvent(eventName)
{

    if (!isConfiguredId(paddleCreekAnalyticsConfig.ga4MeasurementId))
    {

        return;

    }

    if (typeof window.gtag !== 'function')
    {

        return;

    }

    window.gtag('event', eventName);

}

/**
 * Loads the official Microsoft Clarity snippet, only when a real Project
 * ID has been supplied.
 */
function loadMicrosoftClarity(projectId)
{

    if (!isConfiguredId(projectId))
    {

        return;

    }

    (function (win, doc, tagName, key, id)
    {

        win[key] = win[key] || function ()
        {

            (win[key].q = win[key].q || []).push(arguments);

        };

        const script = doc.createElement(tagName);

        script.async = true;

        script.src = 'https://www.clarity.ms/tag/' + id;

        const firstScript = doc.getElementsByTagName(tagName)[0];

        firstScript.parentNode.insertBefore(script, firstScript);

    })(window, document, 'script', 'clarity', projectId);

}


/* ============================================================
   INITIALIZATION
============================================================ */

loadGoogleAnalytics(paddleCreekAnalyticsConfig.ga4MeasurementId);

loadMicrosoftClarity(paddleCreekAnalyticsConfig.clarityProjectId);
