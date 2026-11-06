/* ==========================================================================
   MOBILITY — CAMADA DE AUTENTICAÇÃO DO PAINEL
   Preparada para receber Supabase Auth na próxima etapa.

   Modo atual: desenvolvimento.
   - Nenhuma credencial é validada.
   - "enterDemo" abre explicitamente o modo demonstração.
   - Não há sessão segura nem persistência.
   ========================================================================== */
(function () {
  'use strict';

  class DevelopmentAuth {
    constructor() {
      this.mode = 'development';
      this.session = null;
    }

    async signIn() {
      return {
        ok: false,
        code: 'auth-not-configured',
        message:
          'Autenticação real ainda não configurada. Use o modo demonstração. O Supabase Auth será conectado na próxima etapa.'
      };
    }

    async enterDemo() {
      this.session = {
        demo: true,
        user: {
          name: 'Modo demonstração',
          email: 'demo@local'
        }
      };
      return { ok: true, session: this.session };
    }

    async getSession() {
      return this.session;
    }

    async signOut() {
      this.session = null;
      return { ok: true };
    }
  }

  class SupabaseAuth {
    constructor(options = {}) {
      this.mode = 'supabase';
      this.client = options.client || null;
    }

    assertConfigured() {
      if (!this.client) {
        throw new Error('Supabase Auth ainda não configurado nesta etapa.');
      }
    }

    async signInWithPassword() {
      this.assertConfigured();
      throw new Error('signInWithPassword será implementado na próxima etapa.');
    }

    async getSession() {
      this.assertConfigured();
      throw new Error('getSession será implementado na próxima etapa.');
    }

    async signOut() {
      this.assertConfigured();
      throw new Error('signOut será implementado na próxima etapa.');
    }

    onAuthStateChange() {
      this.assertConfigured();
      throw new Error('onAuthStateChange será implementado na próxima etapa.');
    }
  }

  window.MobilityAuthService = {
    config: {
      mode: 'development',
      provider: 'local-demo'
    },
    createDevelopmentAuth: () => new DevelopmentAuth(),
    createSupabaseAuth: (options) => new SupabaseAuth(options)
  };
})();
