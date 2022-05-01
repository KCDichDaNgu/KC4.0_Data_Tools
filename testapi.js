import { customAxios } from '../utils/custom-axios';
import qs from 'querystring';

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("header exists", function() {
    pm.response.to.have.header(Content-Type);
});

pm.test("header has value", function() {
    pm.expect(pm.response.headers.get('Content-Type')).to.eql('application/json');
});

pm.test("Match body", function() {
    pm.response.to.have.body("OK");
    pm.response.to.have.body('{"success"=true}');
});

pm.test("Partial Body match", function() {
    pm.expect(pm.response.data).to.include('Dịch đa ngữ');
});

pm.test("Check value", function() {
    const response = pm.response.json();
    pm.expect(response.data.method).to.eql(post);
    pm.expect(response.dataurl).to.eql('${server_endpoint}/api/data-field/search');
});

pm.test("Check value", function() {
    const response = xml2Json(responseBody);
    pm.expect(response.data.headers).to.eql('Content-Type', 'application/json');
});