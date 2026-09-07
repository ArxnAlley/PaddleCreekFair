/* ============================================================
   PADDLE CREEK PAINTS — siteJS.js

   Shared behaviour for every page.

   1. Constants
   2. Piece Catalogue
   3. Selectors
   4. State
   5. Utility Functions
   6. Mobile Menu
   7. Header
   8. Meet Mary Video
   9. Service Marquee
   10. Piece Viewer
   11. Piece Inquiry Handoff
   12. Commission Form
   13. Ten Percent Offer
   14. Event Listeners
   15. Initialization
============================================================ */


/* ============================================================
   CONSTANTS
============================================================ */

const STUDIO_EMAIL = 'paddlecreekpaints@gmail.com';

const ARTIST_NAME = 'Mary';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input, select, textarea';


/* ============================================================
   SITE CONFIGURATION

   ── THE ONE THING TO FILL IN ──────────────────────────────

   offerEndpointUrl is the deployed Google Apps Script Web App
   URL that receives 10% offer signups. Paste the URL ending in
   /exec between the quotes below and nothing else on the site
   needs to change.

   Deployment instructions: googleAppsScript/README.md

   Until a real URL is pasted here, the offer form stays polite
   and honest: it tells the visitor to write to the studio
   instead of pretending a signup was received.
============================================================ */

const paddleCreekConfig = {

    /* Paste the deployed Google Apps Script Web App URL here. */

    offerEndpointUrl: 'https://script.google.com/macros/s/AKfycbyLgZ9dC8Zs_6J0XttJq-C6m1qkWHXpgzJkeDkbj1Rs3RWbqDMhKgatm-WpD9CZ9ly7Dw/exec',

    /* How long to wait for the endpoint before giving up, in ms. */

    offerRequestTimeout: 15000

};


/* ============================================================
   PIECE CATALOGUE

   Every field is taken from what the supplied photograph actually
   shows. No title, price, dimension or availability is invented;
   a fact that is not known is simply absent from the record, and
   the viewer renders only the fields a piece actually has.
============================================================ */

const pieceCatalogue = [
    {
        id: 'equine',
        subject: 'Horse portrait with roses and gold leaf',
        surface: 'Stretched canvas',
        note: 'Painted on stretched canvas, with the bridle detailed in turquoise and the background worked in gold leaf.',
        width: 1125,
        height: 1500,
        views: [
            {
                image: 'images/artwork/equinePortrait.webp',
                alt: 'A black horse in a turquoise bridle painted on canvas with red roses and gold leaf.'
            },
            {
                image: 'images/artwork/equineDetail.webp',
                alt: 'The horse’s eye and turquoise bridle, close up.'
            },
            {
                image: 'images/artwork/equineRosesDetail.webp',
                alt: 'Red roses and gold leaf along the lower edge of the canvas.'
            }
        ]
    },

    {
        id: 'skillet',
        subject: 'Whitetail deer in autumn woods',
        surface: 'Cast-iron skillet',
        note: 'Painted down inside the pan, so the scene sits in the base of the skillet rather than on a flat panel.',
        width: 720,
        height: 960,
        views: [
            {
                image: 'images/artwork/paintedSkillet.webp',
                alt: 'A cast-iron skillet held in a hand, painted inside with a whitetail deer in autumn woods.'
            },
            {
                image: 'images/artwork/skilletDetail.webp',
                alt: 'The painted deer at the base of the pan, close up.'
            }
        ]
    },

    {
        id: 'haunted',
        subject: 'Ghosts, a cabin and a harvest moon',
        surface: 'Wooden board',
        note: 'A seasonal piece on a wooden board, finished with a lace tie so it can hang.',
        width: 965,
        height: 1286,
        views: [
            {
                image: 'images/artwork/hauntedCuttingBoard.webp',
                alt: 'A wooden cutting board held in a hand, painted with ghosts, a haunted house and a harvest moon.'
            },
            {
                image: 'images/artwork/hauntedDetail.webp',
                alt: 'The cabin, the moon and the ghosts, close up.'
            }
        ]
    },

    {
        id: 'americana',
        subject: 'Barn and flag beneath the mountains',
        surface: 'Round wood cutout',
        note: 'A small round keepsake, painted edge to edge and tied with lace.',
        width: 900,
        height: 1150,
        views: [
            {
                image: 'images/artwork/americanaRoundFramed.webp',
                alt: 'A round wood cutout tied with lace, painted with a barn and an American flag under a mountain sky.'
            },
            {
                image: 'images/artwork/americanaDetail.webp',
                alt: 'The barn and flag at the centre of the round, close up.'
            }
        ]
    },

    {
        id: 'jeans',
        subject: 'Hand-lettered senior year, gingham and lace',
        surface: 'Denim jeans',
        note: 'Lettering painted straight onto the denim, then finished with gingham ties and a lace hem.',
        width: 1100,
        height: 1467,
        views: [
            {
                image: 'images/photos/customSeniorJeans1100.webp',
                alt: 'Denim jeans hand-lettered with a graduation year in red and white, finished with gingham ties and lace.'
            },
            {
                image: 'images/photos/seniorJeansDetail.webp',
                alt: 'The painted lettering on the denim, close up.'
            }
        ]
    },

    {
        id: 'venue',
        subject: 'A mountain lake, hand lettered',
        surface: 'Wooden board',
        note: 'A keepsake board painted with a specific place, then hand-lettered with the words that matter to the people it was made for.',
        width: 640,
        height: 935,
        views: [
            {
                image: 'images/photos/weddingVenueBackdrop640.webp',
                alt: 'A wooden board painted with a mountain lake, finished with hand lettering.'
            },
            {
                image: 'images/photos/venueLakeDetail.webp',
                alt: 'The painted lake and pine forest, close up.'
            }
        ]
    }
];


/* ============================================================
   SELECTORS
============================================================ */

const siteHeader = document.querySelector('.siteHeader');

const headerInner = document.querySelector('.headerInner');

const menuToggle = document.querySelector('#menuToggle');

const primaryNav = document.querySelector('#primaryNav');

const marqueeViewport = document.querySelector('.marqueeViewport');

const pieceLiftButtons = Array.from(document.querySelectorAll('.pieceLift'));

const pieceViewer = document.querySelector('#pieceViewer');

const pieceViewerImage = document.querySelector('#pieceViewerImage');

const pieceViewerSubject = document.querySelector('#pieceViewerSubject');

const pieceViewerSurface = document.querySelector('#pieceViewerSurface');

const pieceViewerNote = document.querySelector('#pieceViewerNote');

const pieceViewerViews = document.querySelector('#pieceViewerViews');

const pieceViewerAction = document.querySelector('#pieceViewerAction');

const pieceViewerCount = document.querySelector('#pieceViewerCount');

const pieceViewerPrev = document.querySelector('#pieceViewerPrev');

const pieceViewerNext = document.querySelector('#pieceViewerNext');

const commissionForm = document.querySelector('#commissionForm');

const formStatus = document.querySelector('#formStatus');

const formPieceRef = document.querySelector('#formPieceRef');

const formPieceRefName = document.querySelector('#formPieceRefName');

const formPieceRefClear = document.querySelector('#formPieceRefClear');

const pieceSurfaceField = document.querySelector('#pieceSurface');

const pieceIdeaField = document.querySelector('#pieceIdea');

const offerForm = document.querySelector('#offerForm');

const offerEmailField = document.querySelector('#offerEmail');

const offerStatus = document.querySelector('#offerStatus');

const footerYear = document.querySelector('#footerYear');

const heroVideo = document.querySelector('#heroVideo');

const heroVideoPlayButton = document.querySelector('#heroVideoPlayButton');


/* ============================================================
   STATE
============================================================ */

let menuOpen = false;

let viewerIndex = 0;

let lastFocusedElement = null;

let referencedPieceId = '';

let offerSubmitting = false;

let commissionSubmitting = false;

let lastOfferEmailSent = '';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');


/* ============================================================
   UTILITY FUNCTIONS
============================================================ */

function findPiece(pieceId)
{

    return pieceCatalogue.find(function (piece)
    {

        return piece.id === pieceId;

    });

}


function readQueryValue(name)
{

    return new URLSearchParams(window.location.search).get(name) || '';

}


function trapFocus(container, event)
{

    const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(function (node)
    {

        return node.offsetParent !== null;

    });

    if (focusable.length === 0)
    {

        return;

    }

    const first = focusable[0];

    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first)
    {

        event.preventDefault();

        last.focus();

        return;

    }

    if (!event.shiftKey && document.activeElement === last)
    {

        event.preventDefault();

        first.focus();

    }

}


function isEmailShaped(value)
{

    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

}


function setFieldError(field, message)
{

    const wrapper = field.closest('.formField');

    const errorSlot = document.querySelector('[data-error-for="' + field.id + '"]');

    if (!wrapper || !errorSlot)
    {

        return;

    }

    if (message)
    {

        wrapper.classList.add('hasError');

        field.setAttribute('aria-invalid', 'true');

        errorSlot.textContent = message;

        return;

    }

    wrapper.classList.remove('hasError');

    field.removeAttribute('aria-invalid');

    errorSlot.textContent = '';

}


/* ============================================================
   MOBILE MENU
============================================================ */

/* The menu is a full-screen panel on phones, so opening it is a modal-ish
   act: the page behind it stops scrolling, the header drops its blur (see
   styleIndex.css — the blur is what used to trap the panel inside the header
   box), and focus moves into the panel. The toggle itself never moves; only
   the bars inside it morph into an X. */

function openMobileMenu()
{

    menuOpen = true;

    primaryNav.classList.add('isOpen');

    menuToggle.setAttribute('aria-expanded', 'true');

    document.body.classList.add('isNavOpen');

    if (siteHeader)
    {

        siteHeader.classList.add('navOpen');

    }

    const firstLink = primaryNav.querySelector('a[href]');

    if (firstLink)
    {

        firstLink.focus();

    }

}


function closeMobileMenu()
{

    menuOpen = false;

    primaryNav.classList.remove('isOpen');

    menuToggle.setAttribute('aria-expanded', 'false');

    document.body.classList.remove('isNavOpen');

    if (siteHeader)
    {

        siteHeader.classList.remove('navOpen');

    }

}


function toggleMobileMenu()
{

    if (menuOpen)
    {

        closeMobileMenu();

        return;

    }

    openMobileMenu();

}


/* ============================================================
   HEADER
============================================================ */

function updateHeaderState()
{

    if (window.scrollY > 24)
    {

        siteHeader.classList.add('isStuck');

        return;

    }

    siteHeader.classList.remove('isStuck');

}


/* ============================================================
   MEET MARY VIDEO

   The cover the visitor sees before playback is the real
   artistPhoto (set as the video's poster in the HTML) — not an
   extracted video frame. This function is the only thing that
   starts playback: it is called solely from the play button's
   click handler, so preload="none" on the video only ever
   resolves into an actual fetch after a genuine user gesture.
============================================================ */

function playHeroVideo()
{

    if (!heroVideo || !heroVideoPlayButton)
    {

        return;

    }

    function revealVideo()
    {

        heroVideoPlayButton.hidden = true;

        /* Not focusable while the button covers it (tabindex="-1" in the
           markup), so a keyboard user tabbing past doesn't land on a
           hidden, covered video before ever reaching the visible button.
           Restored the moment it is actually playable, then focused so
           native keyboard media controls work immediately. */

        heroVideo.removeAttribute('tabindex');

        heroVideo.focus();

    }

    const playResult = heroVideo.play();

    if (playResult && typeof playResult.then === 'function')
    {

        playResult.then(revealVideo).catch(function ()
        {

            /* Playback did not start — leave the button in place so the
               visitor can try again rather than showing a bare, inert
               video area. */

        });

        return;

    }

    revealVideo();

}


/* ============================================================
   SERVICE MARQUEE
============================================================ */

function pauseMarquee()
{

    marqueeViewport.classList.add('isPaused');

}


function resumeMarquee()
{

    marqueeViewport.classList.remove('isPaused');

}


/* ============================================================
   PIECE VIEWER
============================================================ */

function renderViewerThumbs(piece, activeIndex)
{

    pieceViewerViews.innerHTML = '';

    if (piece.views.length < 2)
    {

        pieceViewerViews.hidden = true;

        return;

    }

    pieceViewerViews.hidden = false;

    piece.views.forEach(function (view, index)
    {

        const item = document.createElement('li');

        const button = document.createElement('button');

        button.type = 'button';

        button.className = 'pieceViewerThumb';

        button.setAttribute('aria-label', 'View ' + (index + 1) + ' of ' + piece.views.length);

        if (index === activeIndex)
        {

            button.classList.add('isCurrent');

            button.setAttribute('aria-current', 'true');

        }

        const image = document.createElement('img');

        image.src = view.image;

        image.alt = '';

        image.loading = 'lazy';

        image.decoding = 'async';

        button.appendChild(image);

        button.addEventListener(
            'click',
            function ()
            {

                showViewerView(piece, index);

            }
        );

        item.appendChild(button);

        pieceViewerViews.appendChild(item);

    });

}


function showViewerView(piece, viewIndex)
{

    const view = piece.views[viewIndex];

    pieceViewerImage.src = view.image;

    pieceViewerImage.alt = view.alt;

    renderViewerThumbs(piece, viewIndex);

}


function renderViewerPiece(index)
{

    const piece = pieceCatalogue[index];

    if (!piece)
    {

        return;

    }

    viewerIndex = index;

    pieceViewerImage.width = piece.width;

    pieceViewerImage.height = piece.height;

    pieceViewerSubject.textContent = piece.subject;

    pieceViewerSurface.textContent = piece.surface;

    pieceViewerNote.textContent = piece.note;

    pieceViewerCount.textContent = 'Piece ' + (index + 1) + ' of ' + pieceCatalogue.length;

    pieceViewerAction.dataset.piece = piece.id;

    pieceViewerAction.href = '#' + commissionForm.closest('section').id;

    showViewerView(piece, 0);

}


function openPieceViewer(pieceId)
{

    const index = pieceCatalogue.findIndex(function (piece)
    {

        return piece.id === pieceId;

    });

    if (index < 0)
    {

        return;

    }

    lastFocusedElement = document.activeElement;

    renderViewerPiece(index);

    pieceViewer.hidden = false;

    document.body.classList.add('isViewerOpen');

    window.requestAnimationFrame(function ()
    {

        pieceViewer.classList.add('isOpen');

    });

    pieceViewer.querySelector('.pieceViewerClose').focus();

}


function closePieceViewer()
{

    pieceViewer.classList.remove('isOpen');

    document.body.classList.remove('isViewerOpen');

    const finish = function ()
    {

        pieceViewer.hidden = true;

    };

    if (prefersReducedMotion.matches)
    {

        finish();

    }
    else
    {

        window.setTimeout(finish, 320);

    }

    if (lastFocusedElement)
    {

        lastFocusedElement.focus();

        lastFocusedElement = null;

    }

}


function stepPieceViewer(delta)
{

    const next = (viewerIndex + delta + pieceCatalogue.length) % pieceCatalogue.length;

    renderViewerPiece(next);

}


/* ============================================================
   PIECE INQUIRY HANDOFF

   Lifting a piece down and asking about it is one movement. When
   the page already carries the form, the reference is applied in
   place; otherwise the piece travels to the commission page as a
   query value and is applied on arrival.
============================================================ */

function applyPieceReference(pieceId)
{

    const piece = findPiece(pieceId);

    if (!piece || !formPieceRef)
    {

        return;

    }

    referencedPieceId = piece.id;

    formPieceRefName.textContent = piece.subject + ' \u00b7 ' + piece.surface;

    formPieceRef.hidden = false;

    if (pieceSurfaceField)
    {

        const match = Array.from(pieceSurfaceField.options).find(function (option)
        {

            return option.value.toLowerCase() === piece.surface.toLowerCase();

        });

        pieceSurfaceField.value = match ? match.value : 'Something of my own';

    }

}


function clearPieceReference()
{

    referencedPieceId = '';

    if (formPieceRef)
    {

        formPieceRef.hidden = true;

        formPieceRefName.textContent = '';

    }

}


function carryPieceIntoCommission(event)
{

    const pieceId = pieceViewerAction.dataset.piece;

    if (!commissionForm)
    {

        return;

    }

    event.preventDefault();

    applyPieceReference(pieceId);

    closePieceViewer();

    window.setTimeout(
        function ()
        {

            commissionForm.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'start' });

            if (pieceIdeaField)
            {

                pieceIdeaField.focus({ preventScroll: true });

            }

        },
        prefersReducedMotion.matches ? 0 : 360
    );

}


/* ============================================================
   COMMISSION FORM  —  funnel 2 of 2

   Start a Piece posts to the same Apps Script Web App as the
   10% offer, but declares submissionType 'commissionInquiry',
   which routes it to the CommissionLeads sheet and its own pair
   of emails. It shares no record, no sheet and no message with
   the discount funnel, and submitting it never earns the
   discount code.

   Until an endpoint is configured it still falls back to the
   original mail-client handoff rather than pretending to have
   received anything.
============================================================ */

function validateCommissionForm()
{

    const name = document.querySelector('#visitorName');

    const email = document.querySelector('#visitorEmail');

    let firstInvalid = null;

    if (!name.value.trim())
    {

        setFieldError(name, 'Please tell me your name so I know who I am writing back to.');

        firstInvalid = firstInvalid || name;

    }
    else
    {

        setFieldError(name, '');

    }

    if (!isEmailShaped(email.value))
    {

        setFieldError(email, 'I need an email address to reply to \u2014 please check this one.');

        firstInvalid = firstInvalid || email;

    }
    else
    {

        setFieldError(email, '');

    }

    if (!pieceIdeaField.value.trim())
    {

        setFieldError(pieceIdeaField, 'Even one sentence about what you would like painted is enough to start.');

        firstInvalid = firstInvalid || pieceIdeaField;

    }
    else
    {

        setFieldError(pieceIdeaField, '');

    }

    return firstInvalid;

}


function readCommissionFields()
{

    const referenced = findPiece(referencedPieceId);

    return {

        name: document.querySelector('#visitorName').value.trim(),

        email: document.querySelector('#visitorEmail').value.trim(),

        surface: pieceSurfaceField.value,

        idea: pieceIdeaField.value.trim(),

        occasion: document.querySelector('#pieceOccasion').value.trim(),

        referencedPiece: referenced
            ? referenced.subject + ' \u00b7 ' + referenced.surface
            : ''

    };

}


/* The fallback used only when no endpoint is configured yet: hand the
   visitor a fully composed message in their own mail client and say
   plainly that nothing was sent from the page. This is what the form did
   before it had a backend, kept because a half-built endpoint should never
   silently swallow somebody's commission. */

function handOffCommissionByMail(fields)
{

    const subject = fields.referencedPiece
        ? 'Enquiry about \u201c' + fields.referencedPiece + '\u201d'
        : 'Custom piece enquiry \u2014 ' + fields.surface;

    const bodyLines = [
        'Name: ' + fields.name,
        'Email: ' + fields.email,
        'Surface: ' + fields.surface,
        fields.occasion ? 'Occasion: ' + fields.occasion : null,
        fields.referencedPiece ? 'Piece I was looking at: ' + fields.referencedPiece : null,
        '',
        fields.idea
    ].filter(function (line)
    {

        return line !== null;

    });

    formStatus.classList.add('isSent');

    formStatus.textContent = 'Your email app should be opening with this message ready to send. '
        + 'If nothing opens, please write to ' + STUDIO_EMAIL + ' and paste it in \u2014 '
        + 'nothing has been sent from this page yet.';

    window.location.href = 'mailto:' + STUDIO_EMAIL
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(bodyLines.join('\n'));

}


function setCommissionSubmittingState(isSubmitting)
{

    commissionSubmitting = isSubmitting;

    const submitButton = commissionForm.querySelector('.commissionSubmit');

    if (submitButton)
    {

        submitButton.disabled = isSubmitting;

        submitButton.textContent = isSubmitting ? 'Sending\u2026' : 'Send my idea';

    }

}


async function submitCommissionForm(event)
{

    event.preventDefault();

    if (commissionSubmitting)
    {

        return;

    }

    const firstInvalid = validateCommissionForm();

    if (firstInvalid)
    {

        formStatus.classList.remove('isSent');

        formStatus.textContent = 'Please check the highlighted fields above.';

        firstInvalid.focus();

        return;

    }

    const fields = readCommissionFields();

    if (!isOfferEndpointConfigured())
    {

        handOffCommissionByMail(fields);

        return;

    }

    setCommissionSubmittingState(true);

    formStatus.classList.remove('isSent');

    formStatus.textContent = 'Sending your idea to ' + ARTIST_NAME + '\u2026';

    const abortController = new AbortController();

    const timeoutHandle = window.setTimeout(
        function ()
        {

            abortController.abort();

        },
        paddleCreekConfig.offerRequestTimeout
    );

    try
    {

        /* text/plain keeps the request CORS-simple for Apps Script. */

        const response = await fetch(paddleCreekConfig.offerEndpointUrl, {

            method: 'POST',

            headers: { 'Content-Type': 'text/plain;charset=utf-8' },

            body: JSON.stringify({

                submissionType: 'commissionInquiry',

                visitorName: fields.name,

                visitorEmail: fields.email,

                pieceSurface: fields.surface,

                pieceIdea: fields.idea,

                pieceOccasion: fields.occasion,

                referencedPiece: fields.referencedPiece,

                honeypot: document.querySelector('#commissionCompany').value,

                source: 'fairCommission'

            }),

            signal: abortController.signal

        });

        const result = await response.json();

        if (result.success)
        {

            commissionForm.reset();

            clearPieceReference();

            formStatus.classList.add('isSent');

            formStatus.textContent = result.message
                || ('Thank you \u2014 your inquiry is with ' + ARTIST_NAME
                    + ', and a copy is on its way to your inbox.');

            trackConversionEvent('commissionInquiry');

        }
        else
        {

            const serverMessage = (result.errors && result.errors.length)
                ? result.errors[0]
                : (result.message || 'Your idea could not be sent.');

            formStatus.classList.remove('isSent');

            formStatus.textContent = serverMessage + ' Please try again.';

        }

    }
    catch (commissionError)
    {

        formStatus.classList.remove('isSent');

        formStatus.textContent = 'Your idea could not be sent just now. Please check your '
            + 'connection and try again, or write to ' + STUDIO_EMAIL + '.';

    }
    finally
    {

        window.clearTimeout(timeoutHandle);

        setCommissionSubmittingState(false);

    }

}


/* ============================================================
   TEN PERCENT OFFER

   One field, one job. The email address goes to a Google Apps
   Script Web App, which records the signup in a Google Sheet
   and emails the discount code back.

   The code itself is never held on this page. It is assigned on
   the server and only ever appears in the confirmation email —
   so the page cannot hand it out to someone who never gave an
   address, and the code can be changed later without touching
   the site.

   The endpoint URL lives in paddleCreekConfig at the top of
   this file. Until it is filled in, the form says so plainly
   rather than pretending the signup was received.
============================================================ */

function isOfferEndpointConfigured()
{

    return paddleCreekConfig.offerEndpointUrl.indexOf('http') === 0;

}


function setOfferStatus(message, isSent)
{

    if (!offerStatus)
    {

        return;

    }

    offerStatus.classList.toggle('isSent', Boolean(isSent));

    offerStatus.textContent = message;

}


function setOfferSubmittingState(isSubmitting)
{

    offerSubmitting = isSubmitting;

    const submitButton = offerForm.querySelector('.offerSubmit');

    if (submitButton)
    {

        submitButton.disabled = isSubmitting;

        submitButton.textContent = isSubmitting ? 'Sending…' : 'Claim My 10% Off';

    }

}


async function submitOfferForm(event)
{

    event.preventDefault();

    if (offerSubmitting)
    {

        return;

    }

    const email = offerEmailField.value.trim();

    if (!isEmailShaped(email))
    {

        setFieldError(
            offerEmailField,
            'I need an email address to send the code to — please check this one.'
        );

        setOfferStatus('', false);

        offerEmailField.focus();

        return;

    }

    setFieldError(offerEmailField, '');

    /* Tapping the button twice should not send a second request
       for an address that has already gone through. */

    if (email.toLowerCase() === lastOfferEmailSent)
    {

        setOfferStatus(
            'Your code is already on its way to ' + email
            + '. Check your inbox, and your spam folder just in case.',
            true
        );

        return;

    }

    if (!isOfferEndpointConfigured())
    {

        setOfferStatus(
            'The discount signup is not connected yet. Please write to ' + STUDIO_EMAIL
            + ' and I will send your code by hand — nothing has been sent from this page.',
            false
        );

        return;

    }

    setOfferSubmittingState(true);

    setOfferStatus('Sending your code…', false);

    const abortController = new AbortController();

    const timeoutHandle = window.setTimeout(
        function ()
        {

            abortController.abort();

        },
        paddleCreekConfig.offerRequestTimeout
    );

    try
    {

        /* text/plain keeps the request CORS-simple for Apps Script. */

        const response = await fetch(paddleCreekConfig.offerEndpointUrl, {

            method: 'POST',

            headers: { 'Content-Type': 'text/plain;charset=utf-8' },

            body: JSON.stringify({

                submissionType: 'discountSignup',

                email: email,

                honeypot: document.querySelector('#offerCompany').value,

                source: 'fairOffer'

            }),

            signal: abortController.signal

        });

        const result = await response.json();

        if (result.success)
        {

            lastOfferEmailSent = email.toLowerCase();

            offerForm.reset();

            /* The code itself is never printed here. The page only ever
               says an email is coming — PADDLE10 exists in the inbox and
               nowhere else, which is what stops the offer being lifted off
               the screen by someone who never left an address. */

            setOfferStatus(
                result.emailSent
                    ? 'You’re in! Check your email. Your 10% discount code is on '
                        + 'its way. Look for an email from Paddle Creek Paints.'
                    : (result.message || 'You are on the list. If the email does not '
                        + 'arrive, write to ' + STUDIO_EMAIL + '.'),
                true
            );

            trackConversionEvent('discountSignup');

        }
        else
        {

            const serverMessage = (result.errors && result.errors.length)
                ? result.errors[0]
                : (result.message || 'Your code could not be sent.');

            setOfferStatus(serverMessage + ' Please try again.', false);

        }

    }
    catch (offerError)
    {

        setOfferStatus(
            'Your code could not be sent just now. Please check your connection and try '
            + 'again, or write to ' + STUDIO_EMAIL + '.',
            false
        );

    }
    finally
    {

        window.clearTimeout(timeoutHandle);

        setOfferSubmittingState(false);

    }

}


/* ============================================================
   EVENT LISTENERS
============================================================ */

if (menuToggle)
{

    menuToggle.addEventListener(
        'click',
        toggleMobileMenu
    );

}

if (heroVideoPlayButton)
{

    heroVideoPlayButton.addEventListener(
        'click',
        playHeroVideo
    );

}

Array.from(document.querySelectorAll('.primaryNavList a')).forEach(function (link)
{

    link.addEventListener(
        'click',
        function ()
        {

            if (menuOpen)
            {

                closeMobileMenu();

            }

        }
    );

});

document.addEventListener(
    'keydown',
    function (event)
    {

        if (pieceViewer && !pieceViewer.hidden)
        {

            if (event.key === 'Escape')
            {

                closePieceViewer();

                return;

            }

            if (event.key === 'ArrowRight')
            {

                stepPieceViewer(1);

                return;

            }

            if (event.key === 'ArrowLeft')
            {

                stepPieceViewer(-1);

                return;

            }

            return;

        }

        /* The open panel covers the viewport, so the tab ring is held inside
           the header — which is where the X lives, and the only way out. */

        if (menuOpen && event.key === 'Tab' && headerInner)
        {

            trapFocus(headerInner, event);

            return;

        }

        if (event.key !== 'Escape')
        {

            return;

        }

        if (menuOpen)
        {

            closeMobileMenu();

            menuToggle.focus();

        }

    }
);

/* Rotating a phone, or resizing into the desktop layout, must not leave the
   full-screen panel and its scroll lock behind. */

window.addEventListener(
    'resize',
    function ()
    {

        if (menuOpen && window.innerWidth > 880)
        {

            closeMobileMenu();

        }

    }
);

if (pieceViewer)
{

    pieceViewer.addEventListener(
        'keydown',
        function (event)
        {

            if (event.key === 'Tab')
            {

                trapFocus(pieceViewer, event);

            }

        }
    );

    Array.from(pieceViewer.querySelectorAll('[data-viewer-close]')).forEach(function (control)
    {

        control.addEventListener(
            'click',
            closePieceViewer
        );

    });

    pieceViewerPrev.addEventListener(
        'click',
        function ()
        {

            stepPieceViewer(-1);

        }
    );

    pieceViewerNext.addEventListener(
        'click',
        function ()
        {

            stepPieceViewer(1);

        }
    );

    pieceViewerAction.addEventListener(
        'click',
        carryPieceIntoCommission
    );

}

pieceLiftButtons.forEach(function (button)
{

    button.addEventListener(
        'click',
        function ()
        {

            openPieceViewer(button.dataset.piece);

        }
    );

});

if (marqueeViewport)
{

    marqueeViewport.addEventListener('pointerenter', pauseMarquee);

    marqueeViewport.addEventListener('pointerleave', resumeMarquee);

    marqueeViewport.addEventListener('focusin', pauseMarquee);

    marqueeViewport.addEventListener('focusout', resumeMarquee);

}

if (formPieceRefClear)
{

    formPieceRefClear.addEventListener(
        'click',
        clearPieceReference
    );

}

if (commissionForm)
{

    commissionForm.addEventListener(
        'submit',
        submitCommissionForm
    );

    Array.from(commissionForm.querySelectorAll('.formInput')).forEach(function (field)
    {

        field.addEventListener(
            'input',
            function ()
            {

                if (field.closest('.formField').classList.contains('hasError'))
                {

                    setFieldError(field, '');

                }

            }
        );

    });

}

if (offerForm)
{

    offerForm.addEventListener(
        'submit',
        submitOfferForm
    );

    offerEmailField.addEventListener(
        'input',
        function ()
        {

            if (offerEmailField.closest('.formField').classList.contains('hasError'))
            {

                setFieldError(offerEmailField, '');

            }

        }
    );

}

window.addEventListener(
    'scroll',
    updateHeaderState,
    { passive: true }
);


/* ============================================================
   INITIALIZATION
============================================================ */

function initializeSite()
{

    if (footerYear)
    {

        footerYear.textContent = String(new Date().getFullYear());

    }

    updateHeaderState();

    const incomingPiece = readQueryValue('piece');

    if (incomingPiece)
    {

        applyPieceReference(incomingPiece);

    }

}

initializeSite();
