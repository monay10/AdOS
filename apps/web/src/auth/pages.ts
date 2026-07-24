import type { Session } from '../session.js';
import { bare, esc, layout } from '../views/layout.js';

type Vals = Record<string, string>;

function authShell(title: string, subtitle: string, body: string, error?: string, notice?: string): string {
  return bare({
    title,
    body: `<div class="login-wrap"><div class="panel login-card">
      <div class="login-brand"><span class="mark" style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#5b8cff,#9d7bff);display:grid;place-items:center;color:#fff">▲</span> AdOS</div>
      <h2 style="text-align:center;margin:0 0 4px">${esc(title)}</h2>
      <p class="sub" style="text-align:center">${esc(subtitle)}</p>
      ${error ? `<div class="err">${esc(error)}</div>` : ''}
      ${notice ? `<div class="ok">${notice}</div>` : ''}
      ${body}
    </div></div>`,
  });
}

export function authLoginPage(error?: string, values: Vals = {}, notice?: string): string {
  return authShell(
    'Sign in',
    'Sign in to your advertising operating system.',
    `<form method="post" action="/login">
       <label>Work email</label>
       <input name="email" type="email" placeholder="you@company.com" value="${esc(values['email'])}" required autofocus>
       <label>Password</label>
       <input name="password" type="password" placeholder="••••••••" required>
       <label style="display:flex;align-items:center;gap:8px;margin-top:12px;font-weight:500">
         <input type="checkbox" name="remember" value="1" style="width:auto"> Remember me for 30 days
       </label>
       <div class="actions"><button class="btn" style="width:100%">Sign in</button></div>
     </form>
     <p class="sub" style="text-align:center;margin-top:16px">
       <a href="/forgot">Forgot password?</a> · <a href="/register">Create account</a>
     </p>`,
    error,
    notice,
  );
}

export function authRegisterPage(error?: string, values: Vals = {}): string {
  return authShell(
    'Create account',
    'Set up your company and owner account.',
    `<form method="post" action="/register">
       <label>Work email</label>
       <input name="email" type="email" placeholder="you@company.com" value="${esc(values['email'])}" required autofocus>
       <label>Company</label>
       <input name="company" placeholder="Bright Smiles Dental" value="${esc(values['company'])}" required>
       <label>Password</label>
       <input name="password" type="password" placeholder="At least 8 characters" required>
       <div class="actions"><button class="btn" style="width:100%">Create account</button></div>
     </form>
     <p class="sub" style="text-align:center;margin-top:16px">Already have an account? <a href="/login">Sign in</a></p>`,
    error,
  );
}

export function forgotPage(error?: string, values: Vals = {}, resetLink?: string): string {
  return authShell(
    'Reset password',
    'We will generate a one-time reset link.',
    resetLink
      ? `<p class="sub">Local reset link (no email is sent in this deployment):</p>
         <div style="word-break:break-all"><a href="${esc(resetLink)}">${esc(resetLink)}</a></div>
         <p class="sub" style="margin-top:16px"><a href="/login">Back to sign in</a></p>`
      : `<form method="post" action="/forgot">
           <label>Work email</label>
           <input name="email" type="email" placeholder="you@company.com" value="${esc(values['email'])}" required autofocus>
           <div class="actions"><button class="btn" style="width:100%">Send reset link</button></div>
         </form>
         <p class="sub" style="text-align:center;margin-top:16px"><a href="/login">Back to sign in</a></p>`,
    error,
  );
}

export function resetPage(email: string, token: string, error?: string): string {
  return authShell(
    'Choose a new password',
    'Set a new password for your account.',
    `<form method="post" action="/reset">
       <input type="hidden" name="email" value="${esc(email)}">
       <input type="hidden" name="token" value="${esc(token)}">
       <label>New password</label>
       <input name="password" type="password" placeholder="At least 8 characters" required autofocus>
       <div class="actions"><button class="btn" style="width:100%">Set new password</button></div>
     </form>`,
    error,
  );
}

export function changePasswordPage(session: Session, error?: string, notice?: string): string {
  return layout({
    title: 'Account',
    active: '/dashboard',
    session,
    body: `<div class="head"><div><h1>Account security</h1><p>Change the password for ${esc(session.actor)}.</p></div></div>
      ${error ? `<div class="err">${esc(error)}</div>` : ''}
      ${notice ? `<div class="ok">${esc(notice)}</div>` : ''}
      <div class="panel">
        <h2>Change password</h2>
        <form method="post" action="/account/password">
          <input type="hidden" name="_csrf" value="${esc(session.csrf ?? '')}">
          <label>Current password</label><input name="current" type="password" required>
          <label>New password</label><input name="next" type="password" placeholder="At least 8 characters" required>
          <div class="actions"><button class="btn">Update password</button></div>
        </form>
      </div>`,
  });
}
