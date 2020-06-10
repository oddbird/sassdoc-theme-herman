import chaiJquery from 'chai-jquery';

chai.use(chaiJquery);

before(function () {
  this.respondTo = (url, status, json, headers) => {
    let matched = false;
    for (const req of this.requests) {
      const fullURL = `${window.location.origin}${url}`;
      if (req.readyState !== 4 && (url === req.url || fullURL === req.url)) {
        matched = true;
        req.respond(
          status,
          headers || { 'Content-Type': 'application/json' },
          JSON.stringify(json)
        );
        break;
      }
    }
    expect(matched, `no requests matched by url ${url}`).to.be.true;
  };
  this.getRequest = (method, url) => {
    let request;
    for (const req of this.requests) {
      if (req.url === url && req.method === method) {
        request = req;
        break;
      }
    }
    expect(request, `no ${method} to ${url} found`).not.to.be.undefined;
    return request;
  };
});

beforeEach(function () {
  this.sandbox = sinon.createSandbox({
    useFakeServer: true,
  });
  this.requests = this.sandbox.server.requests;
});

afterEach(function () {
  this.sandbox.restore();
  $(window).off('resize');
  $('body').off('click toggle:close toggle:open target:close target:open');
});

chai.use((_chai) => {
  const { Assertion } = _chai;

  Assertion.addMethod('containRequest', function (method, url) {
    const obj = this._obj;

    let found = false;
    for (const req of obj) {
      if (req.url === url && req.method === method) {
        found = true;
        break;
      }
    }
    this.assert(
      found,
      `no ${method} to ${url} found`,
      `expected ${method} to ${url} not to exist`
    );
  });
});
