    /* -- SPLIT PAGE shared by sign in and create account: photo on the left, form on the right -- */
    /* Moving between the two pages crossfades the form while the photo side stays put. */
    @@view-transition { navigation: auto; }
    .login-visual { view-transition-name: auth-visual; }
    .auth-toggle { view-transition-name: auth-toggle; }

    .login-split { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); min-height: 100vh; }
    .login-visual {
      position: sticky; top: 0; height: 100vh;
      /* Back button top left; the heading and the card sit together in the centre. */
      display: flex; flex-direction: column; align-items: center; gap: 28px;
      padding: 28px 32px 32px;
      background-color: #2a6a54;
      background-image:
        linear-gradient(180deg, rgba(10,40,30,.35) 0%, rgba(10,40,30,.05) 35%, rgba(10,40,30,.55) 100%),
        url('{{ asset('images/rice-features-paddy.jpg') }}');
      background-position: center; background-size: cover; background-repeat: no-repeat;
      border-right: 1px solid #E3EAE6;
    }
    .login-visual-copy {
      max-width: 440px; margin-top: auto; text-align: center;
      font-size: clamp(26px, 3vw, 38px); font-weight: 600; letter-spacing: -0.035em; line-height: 1.1; color: #fff;
    }
    .login-panel { display: flex; flex-direction: column; align-items: center; padding: 32px 32px 24px; background: #fff; }
    .login-panel-foot { margin-top: auto; padding-top: 32px; font-size: 12px; color: #65736C; text-align: center; }

    /* Back button: the same dark frosted glass as the landing page navbar. */
    .back-link-top {
      align-self: flex-start; display: inline-flex; align-items: center; gap: 8px;
      height: 40px; padding: 0 18px; border-radius: 980px;
      font-size: 14px; font-weight: 500; color: #fff; text-decoration: none;
      background: rgba(14,38,30,.62); border: 1px solid rgba(255,255,255,.12);
      -webkit-backdrop-filter: saturate(180%) blur(20px); backdrop-filter: saturate(180%) blur(20px);
      box-shadow: 0 10px 30px rgba(0,0,0,.25);
      transition: background-color .2s ease;
    }
    .back-link-top:hover { background: rgba(14,38,30,.8); }
    .back-link-top:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

    /* Sign in | Create account switch at the top of the form side. */
    .auth-toggle {
      display: grid; grid-template-columns: 1fr 1fr; gap: 4px;
      width: 100%; max-width: 400px; padding: 4px; margin-bottom: 40px;
      border-radius: 980px; background: #F1F4F2;
    }
    .auth-toggle a {
      display: flex; align-items: center; justify-content: center; height: 40px; border-radius: 980px;
      font-size: 14px; font-weight: 500; color: #65736C; text-decoration: none;
      transition: color .2s ease, background-color .2s ease;
    }
    .auth-toggle a:hover { color: #1E2B25; }
    .auth-toggle a[aria-current="page"] { background: #fff; color: #1E2B25; box-shadow: 0 1px 3px rgba(6,30,22,.12), 0 1px 2px rgba(6,30,22,.06); }
    .auth-toggle a:focus-visible { outline: 2px solid #1F684F; outline-offset: 2px; }

    /* Card on the photo side (weather on sign in, account notes on create account):
       the same dark frosted glass as the back button and the landing page navbar. */
    .glass-card {
      width: 100%; max-width: 380px; margin-bottom: auto;
      background: rgba(14,38,30,.62); border: 1px solid rgba(255,255,255,.12); border-radius: 28px;
      -webkit-backdrop-filter: saturate(180%) blur(20px); backdrop-filter: saturate(180%) blur(20px);
      box-shadow: 0 30px 80px rgba(0,0,0,.3); padding: 28px; color: #fff;
    }

    @media (max-width: 900px) {
      .login-split { grid-template-columns: minmax(0, 1fr); }
      .login-visual { position: relative; height: auto; border-right: 0; border-bottom: 1px solid #E3EAE6; padding: 20px 20px 24px; }
      .login-visual-copy { margin-top: 12px; }
      .glass-card { margin-bottom: 0; }
      .login-panel { padding: 28px 20px 24px; }
    }
    @media (max-width: 560px) {
      .glass-card { padding: 22px; border-radius: 22px; }
    }
