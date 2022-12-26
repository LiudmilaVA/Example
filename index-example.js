import Tabs from "./modules/Tabs.js";
import Popup from "./modules/Popup.js";
import FormValidation from "./modules/FormValidation.js";
import {
    S_DonateSubscribeForm
} from "./modules/donateForm.js";

class Tabs {
    constructor() {
        this.tabs = document.querySelector(".tabs");
        this.content = document.querySelectorAll(".tabs__list-content");
        this.links = document.querySelectorAll(".tabs__list-link");
        this.tabsItems = document.querySelectorAll(".tabs__list-item");
        this.init();
    }

    init() {
        if (!this.tabs) return;

        $(this.content).hide();
        this.toggleTabs();
        this.openActiveTab();
        this.bindLinkToContent();
        this.openQuestionOnLoad();
    }

    toggleTabs() {
        $(this.links).on('click', function (e) {
            e.preventDefault();
            let href = $(this).attr('href');

            if ($(this).hasClass('active')) {
                $(href).slideUp(500);
                $(this).removeClass('active');
            } else {
                $(this).addClass('active');
                $(href).slideDown(500);
            }
        });
    }

    openActiveTab() {
        let attr = $('.tabs__list-link.active').attr('href');
        $(attr).show();
    }

    bindLinkToContent() {
        $(this.tabsItems).each(function (i, el) {
            const link = $(el).find('.tabs__list-link');
            const content = $(el).find('.tabs__list-content');
            let href, id;

            const isSetId = $(content).attr('id') !== "";

            if (isSetId) {
                href = '#' + $(content).attr('id');
            } else {
                href = '#tab' + i;
                id = 'tab' + i;
                $(content).attr('id', id);
            }

            $(link).attr('href', href);
        });
    }

    openQuestionOnLoad() {
        const tabHash = window.location.hash;
        if (!tabHash) return;

        $('html, body')
            .clearQueue()
            .animate({scrollTop: $(tabHash).parent().offset().top}, 0);

        $(tabHash).siblings('a').click();
    }
}

class Popup {
    constructor() {
        this.btnOpenList = document.querySelectorAll('[data-popup-open]');
        this.btnClose = document.querySelector('[data-popup-close]');
        this.popup = document.querySelector('.popup');
        this.init();
        this.profile = {
            'img': null,
            'src': null,
            'title': null,
            'subtitle': null,
            'content-1': null,
            'content-2': null,
        }
    }

    init() {
        this.open();
    }

    open() {
        this.btnOpenList.forEach(el => {
            $(el).on('click', event => {
                const card = event.target.closest('.card');

                this.updateProfile(card);
                this.fillPopup();

                this.popup.classList.add('open');
                $('body').addClass('modal-open');

                this.handlePopupEvents();
                this.resetProfile();
            });
        });
    }

    close () {
        $(this.btnClose).on('click', event => {
            this.popup.classList.remove('open');
            $('body').removeClass('modal-open');
        });
    }

    updateProfile(card) {
        for (let prop in this.profile) {
            const elem = card.querySelector(`[data-popup=${prop}]`);
            if (!elem) continue;

            switch (prop) {
                case 'src':
                    this.profile[prop] = elem.src;
                    break;
                case 'img':
                    const imgClassList = elem.classList.value;
                    this.profile[prop] = imgClassList;
                    break;
                default:
                    this.profile[prop] = elem.innerHTML;
                    break;
            }
        }
    }

    fillPopup() {
        for (let prop in this.profile) {
            const elem = this.popup.querySelector(`[data-popup=${prop}]`);
            const value = this.profile[prop];

            if (!value) continue;

            switch (prop) {
                case 'src':
                    elem.src = value;
                    break;
                case 'img':
                    elem.classList = value;
                    break;
                case 'content-2':
                    elem.closest('.card--inner').classList.toggle('hidden', !value);
                    elem.innerHTML = value;
                    break;
                default:
                    elem.innerHTML = value;
                    break;
            }
        }
    }

    resetProfile() {
        for (let prop in this.profile) {
            this.profile[prop] = null;
        }
        this.fillPopup();
    }

    handlePopupEvents() {
        this.close();

        const btnToForm = this.popup.querySelector('.popup-btn');
        btnToForm.addEventListener('click', () => {
            this.btnClose.click();
        });

        this.setPopupTopPosition();
    }

    setPopupTopPosition() {
        const wrap = this.popup.querySelector('.popup--wrap');
    }

}

$(document).ready(function () {
    const tabs = new Tabs();
    const popup = new Popup();

    const donateForm = document.querySelector('.js-paymentForm');
    if (donateForm) {
        const donateFormHandle = new FormValidation('.js-paymentForm', toggleSubmitLoadingState);
        donateFormHandle.init();
    }

    const questionForm = document.querySelector('#questionForm');
    if (questionForm) {
        const questionFormHandle = new FormValidation('#questionForm', loadingQuestionForm);
        questionFormHandle.init();
        handleForm(questionForm);
    }

    const callbackForm = document.querySelector('#callbackForm');
    if (callbackForm) {
        const callbackFormHandle = new FormValidation('#callbackForm', loadingCallbackForm);
        callbackFormHandle.init();
        handleForm(callbackForm);
    }

    otherSumForm();
    setInputMasks();
    scrollToSection();
    counterAnim();
    blockAnyOtherCharsExceptNumberForNumberInputs();
    updateButtonAmountOnAmountChange();
});

const donateForms = [];
document.addEventListener("DOMContentLoaded", function () {
    if (!Array.isArray(window.donateForms)) {
        return;
    }

    window.donateForms.forEach(opt => {
        const parsedOpt = JSON.parse(opt);
        const donateForm = new S_DonateSubscribeForm();
        donateForm.init(parsedOpt);
        donateForms.push(donateForm);
    });
});

function otherSumForm() {
    const fieldOther = $('.payment__form-radio-other');
    const input = $(fieldOther).find('.form__input');
    const radio = $(fieldOther).find(':radio');

    $(input).on('focus', function () {
        $(radio).prop('checked', true);
    });

    $(radio).on('change', function () {
        $(input).focus();
    });
}

class OurIncredibleBirthdayMask {
    init() {
        this.DELIMITER = ".";
        this.dateField = document.querySelector('#formBirthday');
        this.dateMask = null;

        if (this.dateField === null) {
            return;
        }

        this.dateField.addEventListener('focus', () => {
            this.addBDayMask();
        }, true);

        this.dateField.addEventListener('blur', () => {
            this.dateMask.destroy();


            const val = this.dateField.value;
            const valWithoutMaskChars = this.removeMaskChars(val);

            if(val !== valWithoutMaskChars) {
                this.dateField.value = valWithoutMaskChars;
            }
        }, true);
    }

    removeMaskChars(val) {
        const out = val.split("").filter(char => {
            let isNum = /^\d+$/.test(char);
            return isNum || char === this.DELIMITER;
        });

        return out.join("");
    }

    addBDayMask() {
        const today = new Date();
        const maxYear = today.getFullYear();
        const options = {
            mask: Date,
            max: new Date(maxYear, 0, 1),
            lazy: false,
            pattern: 'DD.`MM.`yyyy',
            overwrite: true,
            // autofix: true,
            blocks: {
                yyyy: {
                    mask: IMask.MaskedRange,
                    from: 1900,
                    to: maxYear,
                    placeholderChar: 'р',
                },
                MM: {
                    mask: IMask.MaskedRange,
                    from: 1,
                    to: 12,
                    placeholderChar: 'м',
                },
                DD: {
                    mask: IMask.MaskedRange,
                    from: 1,
                    to: 31,
                    placeholderChar: 'д',
                },
            },
        };
        this.dateMask = IMask(this.dateField, options);
    }
}

function setInputMasks() {
    const telList = $('input[type="tel"]');
    if (telList.length) {
        $(telList).each(function (i, el) {
            var phoneMask = IMask(el, {
                mask: '+{38} (000) 000-00 00',
            });
        });
    }

    const bDayMask = new OurIncredibleBirthdayMask();
    bDayMask.init();
}

function scrollToSection() {
    const scrollBtnList = $('.js-scroll');

    $(scrollBtnList).each(function (i, el) {
        $(el).on('click', function () {
            let href = $(this).attr('href');

            $('html, body')
                .clearQueue()
                .animate({
                    scrollTop: $(href).offset().top - 50
                }, 1000);
        });
    });
}

function blockAnyOtherCharsExceptNumberForNumberInputs() {
    $('input[Type="number"]').keypress(function (e) {
        if ('0123456789'.includes(e.key)) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
    });
}

function updateButtonAmountOnAmountChange() {
    const radio = $('.payment__form-radio').find(':radio');
    const radioOther = $('.payment__form-radio-other').find('[name="amountCustom"]');

    radio.on("change", function (evt) {
        updateShownValueOnSelectedAmountChange(evt.target.value, false);
    });

    radioOther.on("input", function (evt) {
        updateShownValueOnSelectedAmountChange(evt.target.value, true);
    });

    radioOther.on("focus", function (evt) {
        updateShownValueOnSelectedAmountChange(evt.target.value, true);
    });
}

function updateShownValueOnSelectedAmountChange(value, isSelectingCustomValueEvent) {
    if (typeof value === "string") {
        value = parseInt(value, 10)
    }

    const hiddenInputValue = isSelectingCustomValueEvent ? "true" : "false";
    Array.from(document.querySelectorAll(`[name="isCustomAmountChecked"]`)).forEach(function (el) {
        el.value = hiddenInputValue;
    });

    const isCorrectValue = !Number.isNaN(value) && value > 1;
    if (!isCorrectValue) {
        return;
    }

    Array.from(document.querySelectorAll('.js-shownAmount')).forEach(function (el) {
        el.innerText = value;
    });
}

function loadingQuestionForm(isDisabled = true) {
    toggleLoadingBtn('questionForm', isDisabled);
}

function loadingCallbackForm(isDisabled = true) {
    toggleLoadingBtn('callbackForm', isDisabled);
}

function toggleLoadingBtn(formId, isDisabled) {
    const form = document.getElementById(formId);
    const btnSubmit = form.querySelector('[type=submit]');
    const attrName = isDisabled ? 'data-title-process' : 'data-title-default';
    btnSubmit.classList.toggle("disabled-control", isDisabled);
    btnSubmit.innerText = btnSubmit.getAttribute(attrName);
}

function handleForm(form) {
    const btnSubmit = form.querySelector('[type=submit]');
    const title = form.querySelector('.js-formTitle');
    const fields = form.querySelector('.js-formFields');
    let hideFields = true;

    form.addEventListener('request', function (event) {
        const isSuccess = event.detail.isSuccess;

        if (isSuccess) {
            toggleFieldsClass(hideFields);
            title.innerText = title.getAttribute('data-title-submit');

            setTimeout(function () {
                hideFields = false;
                toggleFieldsClass(hideFields);
                title.innerText = title.getAttribute('data-title-default');

                toggleLoadingBtn(form.id, false);
                form.reset();
            }, 2000);
        }
    });

    function toggleFieldsClass(hideFields) {
        fields.classList.toggle('hidden', hideFields);
        btnSubmit.classList.toggle('hidden', hideFields);
        title.classList.toggle('update', hideFields);
    }
}

function toggleSubmitLoadingState(isDisabled = true) {
    Array.from(document.querySelectorAll('.js-submitDonationButton')).forEach(function (el) {
        el.classList.toggle("disabled-control", isDisabled);

        const textEl = el.querySelector('.btn__text');

        const attrName = isDisabled ? 'data-title-process' : 'data-title-default';
        textEl.innerText = textEl.getAttribute(attrName);
    });
}