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
   8. Service Marquee
   9. Piece Viewer
   10. Piece Inquiry Handoff
   11. Commission Form
   12. Event Listeners
   13. Initialization
============================================================ */


/* ============================================================
   CONSTANTS
============================================================ */

const STUDIO_EMAIL = 'hello@paddlecreekpaints.com';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input, select, textarea';


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

const footerYear = document.querySelector('#footerYear');


/* ============================================================
   STATE
============================================================ */

let menuOpen = false;

let viewerIndex = 0;

let lastFocusedElement = null;

let referencedPieceId = '';

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

function openMobileMenu()
{

    menuOpen = true;

    primaryNav.classList.add('isOpen');

    menuToggle.setAttribute('aria-expanded', 'true');

}


function closeMobileMenu()
{

    menuOpen = false;

    primaryNav.classList.remove('isOpen');

    menuToggle.setAttribute('aria-expanded', 'false');

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
   COMMISSION FORM

   There is no server endpoint for this project yet. Rather than
   pretend a submission was received, the form hands the visitor a
   fully composed message in their own mail client and says so
   plainly. Replace this handler when a backend exists.
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


function submitCommissionForm(event)
{

    event.preventDefault();

    const firstInvalid = validateCommissionForm();

    if (firstInvalid)
    {

        formStatus.classList.remove('isSent');

        formStatus.textContent = 'Please check the highlighted fields above.';

        firstInvalid.focus();

        return;

    }

    const name = document.querySelector('#visitorName').value.trim();

    const email = document.querySelector('#visitorEmail').value.trim();

    const surface = pieceSurfaceField.value;

    const idea = pieceIdeaField.value.trim();

    const occasion = document.querySelector('#pieceOccasion').value.trim();

    const referenced = findPiece(referencedPieceId);

    const subject = referenced
        ? 'Enquiry about \u201c' + referenced.subject + '\u201d'
        : 'Custom piece enquiry \u2014 ' + surface;

    const bodyLines = [
        'Name: ' + name,
        'Email: ' + email,
        'Surface: ' + surface,
        occasion ? 'Occasion: ' + occasion : null,
        referenced ? 'Piece I was looking at: ' + referenced.subject + ' (' + referenced.surface + ')' : null,
        '',
        idea
    ].filter(function (line)
    {

        return line !== null;

    });

    const mailtoUrl = 'mailto:' + STUDIO_EMAIL
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(bodyLines.join('\n'));

    formStatus.classList.add('isSent');

    formStatus.textContent = 'Your email app should be opening with this message ready to send. '
        + 'If nothing opens, please write to ' + STUDIO_EMAIL + ' and paste it in \u2014 '
        + 'nothing has been sent from this page yet.';

    window.location.href = mailtoUrl;

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
