-- Wrong category fixes. Generated from catalog audit.
-- Make DB backup before running this file.
-- Updates are guarded by product id and old category id.
BEGIN;

-- fix #1, excel row 864
UPDATE shop_product SET category_id = '8d0ec951-2645-4ba8-9c5a-57954d004ae8', updated_at = NOW() WHERE id = 'cb1e456b-3876-48c0-82a9-5c1ebf04c355' AND category_id = '532f386e-5d27-4aa6-873b-a5ad0e5be5c7';

-- fix #2, excel row 872
UPDATE shop_product SET category_id = '8d0ec951-2645-4ba8-9c5a-57954d004ae8', updated_at = NOW() WHERE id = '49103984-6eaa-406e-aa06-42410576672f' AND category_id = '532f386e-5d27-4aa6-873b-a5ad0e5be5c7';

-- fix #3, excel row 882
UPDATE shop_product SET category_id = 'c88f7a71-3954-4a5b-9682-7e91aceb3586', updated_at = NOW() WHERE id = '82538b56-d8c1-48b5-83e1-ebce83e53634' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #4, excel row 883
UPDATE shop_product SET category_id = 'c88f7a71-3954-4a5b-9682-7e91aceb3586', updated_at = NOW() WHERE id = 'c3d66293-035a-4efc-831e-e0e13f52d80c' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #5, excel row 895
UPDATE shop_product SET category_id = 'ae50ae48-b73a-41fd-8788-b2fa0b0e381d', updated_at = NOW() WHERE id = '23c6282c-2ec2-47b3-8100-4658dba59915' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #6, excel row 896
UPDATE shop_product SET category_id = 'ae50ae48-b73a-41fd-8788-b2fa0b0e381d', updated_at = NOW() WHERE id = '6c048757-d2df-4a39-9b9a-1b9202430b93' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #7, excel row 897
UPDATE shop_product SET category_id = 'ae50ae48-b73a-41fd-8788-b2fa0b0e381d', updated_at = NOW() WHERE id = '1b98872d-b4f5-4e4b-9d35-d4968ba5b8ce' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #8, excel row 899
UPDATE shop_product SET category_id = 'ae50ae48-b73a-41fd-8788-b2fa0b0e381d', updated_at = NOW() WHERE id = '5accd636-eb0a-4690-8641-85220cb49ffe' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #9, excel row 900
UPDATE shop_product SET category_id = 'ae50ae48-b73a-41fd-8788-b2fa0b0e381d', updated_at = NOW() WHERE id = 'ca0810f9-a86b-4f0c-8953-21c27f2841e9' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #10, excel row 901
UPDATE shop_product SET category_id = 'ae50ae48-b73a-41fd-8788-b2fa0b0e381d', updated_at = NOW() WHERE id = 'a392b93c-ce39-47e4-9394-4fd2e4b4ffbd' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #11, excel row 902
UPDATE shop_product SET category_id = 'ae50ae48-b73a-41fd-8788-b2fa0b0e381d', updated_at = NOW() WHERE id = '7a9a27d3-a960-4a3d-9251-42168d6043a0' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #12, excel row 903
UPDATE shop_product SET category_id = 'ae50ae48-b73a-41fd-8788-b2fa0b0e381d', updated_at = NOW() WHERE id = '179e948a-a511-4c58-993a-9ed85f71daa6' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #13, excel row 904
UPDATE shop_product SET category_id = 'ae50ae48-b73a-41fd-8788-b2fa0b0e381d', updated_at = NOW() WHERE id = 'd418d2ce-2285-418c-88ef-776bc6ae998f' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #14, excel row 905
UPDATE shop_product SET category_id = 'ae50ae48-b73a-41fd-8788-b2fa0b0e381d', updated_at = NOW() WHERE id = '6acf25af-d283-4f6d-823e-c44bcc1669d0' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #15, excel row 906
UPDATE shop_product SET category_id = 'ae50ae48-b73a-41fd-8788-b2fa0b0e381d', updated_at = NOW() WHERE id = '46e636fd-ee2d-4c37-933b-d5f2a7adf0d5' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #16, excel row 908
UPDATE shop_product SET category_id = 'ae50ae48-b73a-41fd-8788-b2fa0b0e381d', updated_at = NOW() WHERE id = '3ae51a7d-eaa1-48bc-a861-5e6dc7f29060' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #17, excel row 909
UPDATE shop_product SET category_id = 'ae50ae48-b73a-41fd-8788-b2fa0b0e381d', updated_at = NOW() WHERE id = '300cb7f8-769a-4885-af0d-90a2c26e53ac' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #18, excel row 910
UPDATE shop_product SET category_id = 'ae50ae48-b73a-41fd-8788-b2fa0b0e381d', updated_at = NOW() WHERE id = 'e581257f-e7f3-43b2-8000-484e74c1ee12' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #19, excel row 911
UPDATE shop_product SET category_id = 'ae50ae48-b73a-41fd-8788-b2fa0b0e381d', updated_at = NOW() WHERE id = 'bfd521bd-24b5-49e6-841e-134b70b2271e' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #20, excel row 912
UPDATE shop_product SET category_id = 'ae50ae48-b73a-41fd-8788-b2fa0b0e381d', updated_at = NOW() WHERE id = '74a019f8-4b1b-4c86-827f-ac45d64dcf6d' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #21, excel row 914
UPDATE shop_product SET category_id = '2b0206e8-bcb1-485a-bdee-268b3f65c06c', updated_at = NOW() WHERE id = 'b258ac76-8fd4-4a7d-9d6d-507ec5b72513' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #22, excel row 915
UPDATE shop_product SET category_id = '2b0206e8-bcb1-485a-bdee-268b3f65c06c', updated_at = NOW() WHERE id = '6e80f888-1fff-4b43-a681-ef09c22876dd' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #23, excel row 916
UPDATE shop_product SET category_id = '2b0206e8-bcb1-485a-bdee-268b3f65c06c', updated_at = NOW() WHERE id = 'd9d364a8-0396-4005-aa84-8ac96d9e89fb' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #24, excel row 917
UPDATE shop_product SET category_id = '2b0206e8-bcb1-485a-bdee-268b3f65c06c', updated_at = NOW() WHERE id = 'f7c6d70e-8bbd-45e4-a8cb-3b588014a3db' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #25, excel row 918
UPDATE shop_product SET category_id = '2b0206e8-bcb1-485a-bdee-268b3f65c06c', updated_at = NOW() WHERE id = 'c65065ba-f4c7-4d28-931d-e04f72b848e6' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #26, excel row 919
UPDATE shop_product SET category_id = '2b0206e8-bcb1-485a-bdee-268b3f65c06c', updated_at = NOW() WHERE id = '1f901b64-b368-4b84-a1b0-a72a9e10dfbd' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #27, excel row 920
UPDATE shop_product SET category_id = '2b0206e8-bcb1-485a-bdee-268b3f65c06c', updated_at = NOW() WHERE id = 'e9c93997-8773-49bf-b877-0cce99651bbc' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #28, excel row 921
UPDATE shop_product SET category_id = '2b0206e8-bcb1-485a-bdee-268b3f65c06c', updated_at = NOW() WHERE id = '5a3e3257-af1c-42a4-b9eb-d9550c1aeb7a' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #29, excel row 927
UPDATE shop_product SET category_id = '9d097397-c5ab-4921-8b75-9edc2aeb82a5', updated_at = NOW() WHERE id = '95592756-9f55-4f1a-9c98-e87bed961ff2' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #30, excel row 932
UPDATE shop_product SET category_id = '9d097397-c5ab-4921-8b75-9edc2aeb82a5', updated_at = NOW() WHERE id = '21fb4ea5-ce7d-4cb6-8c54-5a22faf24e2d' AND category_id = 'c61b66bd-fb4e-4588-bd41-e568ce76075b';

-- fix #31, excel row 1341
UPDATE shop_product SET category_id = 'eaebc146-b483-4175-ba2e-40079caf0285', updated_at = NOW() WHERE id = 'd1b4c933-b10a-4c6a-ad7c-5696626c4b6a' AND category_id = 'd3c25e6a-661f-44dd-8f25-3aa55c858bfb';

-- fix #32, excel row 1342
UPDATE shop_product SET category_id = 'eaebc146-b483-4175-ba2e-40079caf0285', updated_at = NOW() WHERE id = '3913193a-f02c-4506-b7d9-2a60208d8a6d' AND category_id = 'd3c25e6a-661f-44dd-8f25-3aa55c858bfb';

-- fix #33, excel row 1343
UPDATE shop_product SET category_id = 'eaebc146-b483-4175-ba2e-40079caf0285', updated_at = NOW() WHERE id = '63c18f96-4130-4be6-873b-bc3335c45e58' AND category_id = 'd3c25e6a-661f-44dd-8f25-3aa55c858bfb';

-- fix #34, excel row 1344
UPDATE shop_product SET category_id = 'eaebc146-b483-4175-ba2e-40079caf0285', updated_at = NOW() WHERE id = 'baa1678a-3509-4c67-b147-d7054725ca6b' AND category_id = 'd3c25e6a-661f-44dd-8f25-3aa55c858bfb';

-- fix #35, excel row 1345
UPDATE shop_product SET category_id = 'eaebc146-b483-4175-ba2e-40079caf0285', updated_at = NOW() WHERE id = '32301b01-1a10-4ffa-96e2-c1fec06befaf' AND category_id = 'd3c25e6a-661f-44dd-8f25-3aa55c858bfb';

-- fix #36, excel row 1346
UPDATE shop_product SET category_id = 'eaebc146-b483-4175-ba2e-40079caf0285', updated_at = NOW() WHERE id = '1a126a7d-52be-4ebe-9951-9fc08171e28f' AND category_id = 'd3c25e6a-661f-44dd-8f25-3aa55c858bfb';

-- fix #37, excel row 1347
UPDATE shop_product SET category_id = 'eaebc146-b483-4175-ba2e-40079caf0285', updated_at = NOW() WHERE id = 'ae1cad6f-bfd0-48b4-9207-b20b172fc6b6' AND category_id = 'd3c25e6a-661f-44dd-8f25-3aa55c858bfb';

-- fix #38, excel row 1350
UPDATE shop_product SET category_id = 'eaebc146-b483-4175-ba2e-40079caf0285', updated_at = NOW() WHERE id = '387f8095-1d1f-460f-a95f-06d5211db755' AND category_id = 'd3c25e6a-661f-44dd-8f25-3aa55c858bfb';

-- fix #39, excel row 1351
UPDATE shop_product SET category_id = 'eaebc146-b483-4175-ba2e-40079caf0285', updated_at = NOW() WHERE id = '0f8195b5-57c9-45fb-91e9-a7a4febafc2f' AND category_id = 'd3c25e6a-661f-44dd-8f25-3aa55c858bfb';

-- fix #40, excel row 1352
UPDATE shop_product SET category_id = 'eaebc146-b483-4175-ba2e-40079caf0285', updated_at = NOW() WHERE id = 'f5e2c07d-08f9-4445-9e52-a9d8db0585bc' AND category_id = 'd3c25e6a-661f-44dd-8f25-3aa55c858bfb';

-- fix #41, excel row 1557
UPDATE shop_product SET category_id = '582abbef-0f05-44ed-a2f7-60cc8e6fa3c8', updated_at = NOW() WHERE id = '20f3a156-4942-49c5-aa6d-7f36016654fd' AND category_id = '93e4b06a-3ebf-4d63-9d6b-f0150e33b910';

-- fix #42, excel row 1558
UPDATE shop_product SET category_id = '582abbef-0f05-44ed-a2f7-60cc8e6fa3c8', updated_at = NOW() WHERE id = '47b05695-689b-4613-8818-1ed256217a2d' AND category_id = '93e4b06a-3ebf-4d63-9d6b-f0150e33b910';

-- fix #43, excel row 1680
UPDATE shop_product SET category_id = 'd9183449-311d-46df-b4a9-4503d5ced361', updated_at = NOW() WHERE id = 'bda05323-e7a0-4675-825d-14cda73374eb' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #44, excel row 1681
UPDATE shop_product SET category_id = 'd9183449-311d-46df-b4a9-4503d5ced361', updated_at = NOW() WHERE id = '419b1e2f-0750-4aea-bec4-6520a88a1dd5' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #45, excel row 1682
UPDATE shop_product SET category_id = 'd9183449-311d-46df-b4a9-4503d5ced361', updated_at = NOW() WHERE id = '7a42f4b7-92e2-4119-b71e-1ac67d0ba015' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #46, excel row 1683
UPDATE shop_product SET category_id = 'd9183449-311d-46df-b4a9-4503d5ced361', updated_at = NOW() WHERE id = '8c7455b8-f674-47ce-9bbb-af03a8c125f6' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #47, excel row 1684
UPDATE shop_product SET category_id = 'd9183449-311d-46df-b4a9-4503d5ced361', updated_at = NOW() WHERE id = 'b1bdc63e-acd9-49db-809d-4a78dc1c13aa' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #48, excel row 1685
UPDATE shop_product SET category_id = 'd9183449-311d-46df-b4a9-4503d5ced361', updated_at = NOW() WHERE id = '38952727-5bbc-48f6-8338-386492340887' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #49, excel row 1686
UPDATE shop_product SET category_id = 'd9183449-311d-46df-b4a9-4503d5ced361', updated_at = NOW() WHERE id = '7aa84c80-c0c1-473c-a732-1d59d401cf7a' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #50, excel row 1687
UPDATE shop_product SET category_id = 'd9183449-311d-46df-b4a9-4503d5ced361', updated_at = NOW() WHERE id = 'ddabc10f-0322-4dab-9fa3-8a67ba9d2403' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #51, excel row 1688
UPDATE shop_product SET category_id = 'd9183449-311d-46df-b4a9-4503d5ced361', updated_at = NOW() WHERE id = '3f0a7e8a-9b30-4739-a145-7abca578ccbf' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #52, excel row 1689
UPDATE shop_product SET category_id = 'd9183449-311d-46df-b4a9-4503d5ced361', updated_at = NOW() WHERE id = 'ed8868c7-2588-4732-89be-9fa1a16ddb4e' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #53, excel row 1690
UPDATE shop_product SET category_id = 'd9183449-311d-46df-b4a9-4503d5ced361', updated_at = NOW() WHERE id = '3224a17e-f7f3-4b94-85e8-c2355ca6237b' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #54, excel row 1691
UPDATE shop_product SET category_id = 'd9183449-311d-46df-b4a9-4503d5ced361', updated_at = NOW() WHERE id = 'a39ecdb7-b3a8-4ca7-9a5d-dea295783f3b' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #55, excel row 1692
UPDATE shop_product SET category_id = 'd9183449-311d-46df-b4a9-4503d5ced361', updated_at = NOW() WHERE id = '6175a79f-fa6f-4359-95b7-04e74dd0dae4' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #56, excel row 1693
UPDATE shop_product SET category_id = 'd9183449-311d-46df-b4a9-4503d5ced361', updated_at = NOW() WHERE id = 'e9c0f906-8f6d-44a9-8eb3-9ba698f491b2' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #57, excel row 2157
UPDATE shop_product SET category_id = 'c1435747-a132-444a-8357-a8ca9f576861', updated_at = NOW() WHERE id = 'cff09ee9-b0af-4b87-a8cb-2d3ae604a34c' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #58, excel row 2158
UPDATE shop_product SET category_id = 'c1435747-a132-444a-8357-a8ca9f576861', updated_at = NOW() WHERE id = 'a62c0eec-8a9d-463d-8bba-748137692171' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #59, excel row 2160
UPDATE shop_product SET category_id = 'c1435747-a132-444a-8357-a8ca9f576861', updated_at = NOW() WHERE id = 'ea3377a0-68c6-41b2-817c-b7b425a8d580' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #60, excel row 2162
UPDATE shop_product SET category_id = 'c1435747-a132-444a-8357-a8ca9f576861', updated_at = NOW() WHERE id = '5d5ab8f2-4f47-4bff-8d00-c21a0a049c10' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #61, excel row 2164
UPDATE shop_product SET category_id = 'c1435747-a132-444a-8357-a8ca9f576861', updated_at = NOW() WHERE id = '68c5f662-85b3-451c-87cb-f3d8165c8a6d' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #62, excel row 2165
UPDATE shop_product SET category_id = 'c1435747-a132-444a-8357-a8ca9f576861', updated_at = NOW() WHERE id = 'a5289692-af28-424c-b4f9-305418f2e8bf' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #63, excel row 2166
UPDATE shop_product SET category_id = 'c1435747-a132-444a-8357-a8ca9f576861', updated_at = NOW() WHERE id = 'f6c3e769-aed3-4a76-bd5a-a05d9ed09a9b' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #64, excel row 2167
UPDATE shop_product SET category_id = 'c1435747-a132-444a-8357-a8ca9f576861', updated_at = NOW() WHERE id = 'c719173b-c12c-45e5-81d2-2b4047dd7760' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #65, excel row 2168
UPDATE shop_product SET category_id = 'c1435747-a132-444a-8357-a8ca9f576861', updated_at = NOW() WHERE id = 'aabab5f0-9ea1-4d06-8dcb-817076d013b9' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #66, excel row 2169
UPDATE shop_product SET category_id = 'c1435747-a132-444a-8357-a8ca9f576861', updated_at = NOW() WHERE id = '26262dd7-9fb0-4ff6-a8e2-80aefa38078c' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #67, excel row 2170
UPDATE shop_product SET category_id = 'c1435747-a132-444a-8357-a8ca9f576861', updated_at = NOW() WHERE id = 'ff7e0cb9-9894-4ce0-9dcd-b1ae875080d0' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #68, excel row 2171
UPDATE shop_product SET category_id = 'c1435747-a132-444a-8357-a8ca9f576861', updated_at = NOW() WHERE id = 'bbc12203-0838-41e9-9ee2-0c0105718e38' AND category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6';

-- fix #69, excel row 2181
UPDATE shop_product SET category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6', updated_at = NOW() WHERE id = 'a1d9ef9d-8a3f-45f5-8df3-6a6a261663ac' AND category_id = 'c1435747-a132-444a-8357-a8ca9f576861';

-- fix #70, excel row 2183
UPDATE shop_product SET category_id = 'ce477837-d84b-49d5-9f55-99a0c3edc7e6', updated_at = NOW() WHERE id = '253b30b5-bb78-4de0-ab39-5a68f84252a0' AND category_id = 'c1435747-a132-444a-8357-a8ca9f576861';

-- fix #71, excel row 2519
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = 'e8bb7c48-64f4-4b7b-8321-ecf6f21fcdfa' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #72, excel row 2520
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = '46d6992a-5cd8-4bf4-8a24-e3b0ab0890d5' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #73, excel row 2521
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = 'db641aea-528c-43f2-b840-db5bda49b4c0' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #74, excel row 2522
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = 'ca2d3f09-3f9b-4e0d-9ed4-837aaa668527' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #75, excel row 2523
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = 'b3eab860-e6a8-4efc-95a6-fedb9a088983' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #76, excel row 2524
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = '6c6144ca-12c1-4794-938c-d92de720d0c5' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #77, excel row 2525
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = 'f708709e-4211-4aa2-96d6-4bf8c2bcf7b9' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #78, excel row 2526
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = 'ce1483bb-4ee2-4b94-869a-e3a3c9ae0dab' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #79, excel row 2527
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = '4f61f0ba-452f-40ec-a210-d972668967b3' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #80, excel row 2528
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = 'f4de6d4c-945a-4382-a370-a1558db8fa79' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #81, excel row 2530
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = '0463639c-18be-4845-8459-e3a975758671' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #82, excel row 2531
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = '6c41fe25-2bef-4e58-bfea-93ed5c165c98' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #83, excel row 2533
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = '62399aa7-fcd8-4ba6-a24b-1cc4566b0362' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #84, excel row 2534
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = '7750c363-769b-42cb-a458-b785d74ec64a' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #85, excel row 2535
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = 'e6143df7-b56c-4115-a2b2-168d8f564d31' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #86, excel row 2536
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = 'acf5016a-49de-403c-8f41-813d70ac197d' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #87, excel row 2538
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = '6915db0e-1b34-4e57-bee7-952dfe2932db' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #88, excel row 2539
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = 'c9d077c0-30bc-4e37-b2ac-faf4fab1846b' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #89, excel row 2540
UPDATE shop_product SET category_id = '9d4bce17-102d-4e55-9744-c3f0aa232940', updated_at = NOW() WHERE id = 'a38d2728-9873-494a-a0c7-82e8f66998bf' AND category_id = '5f4abd04-471e-4662-afd5-c1d216ff787a';

-- fix #90, excel row 2800
UPDATE shop_product SET category_id = '89c5f154-fa3b-4128-8825-2b770d8ffb48', updated_at = NOW() WHERE id = 'bbb0642e-c583-4c91-8ae0-72669691d5c4' AND category_id = 'c307831e-0cf2-466b-bd5e-0b0b80513dda';

-- fix #91, excel row 2801
UPDATE shop_product SET category_id = '89c5f154-fa3b-4128-8825-2b770d8ffb48', updated_at = NOW() WHERE id = 'bab2d15b-dd22-40ed-aaf3-971bef886786' AND category_id = 'c307831e-0cf2-466b-bd5e-0b0b80513dda';

-- fix #92, excel row 2802
UPDATE shop_product SET category_id = '89c5f154-fa3b-4128-8825-2b770d8ffb48', updated_at = NOW() WHERE id = '9a6d5aff-d2a9-4263-9496-23aa9a1ef37e' AND category_id = 'c307831e-0cf2-466b-bd5e-0b0b80513dda';

-- fix #93, excel row 2803
UPDATE shop_product SET category_id = '89c5f154-fa3b-4128-8825-2b770d8ffb48', updated_at = NOW() WHERE id = 'de40341c-da9a-4ca2-bd61-74c29c0271c3' AND category_id = 'c307831e-0cf2-466b-bd5e-0b0b80513dda';

-- fix #94, excel row 2804
UPDATE shop_product SET category_id = '89c5f154-fa3b-4128-8825-2b770d8ffb48', updated_at = NOW() WHERE id = '2c807245-dcac-4687-90f5-44d0a85dc452' AND category_id = 'c307831e-0cf2-466b-bd5e-0b0b80513dda';

-- fix #95, excel row 2805
UPDATE shop_product SET category_id = '89c5f154-fa3b-4128-8825-2b770d8ffb48', updated_at = NOW() WHERE id = '3eda2897-c0d8-48d0-aabf-a8baeb489229' AND category_id = 'c307831e-0cf2-466b-bd5e-0b0b80513dda';

-- fix #96, excel row 2806
UPDATE shop_product SET category_id = '89c5f154-fa3b-4128-8825-2b770d8ffb48', updated_at = NOW() WHERE id = '8dcfe124-746f-4e66-ab11-5474b9da125a' AND category_id = 'c307831e-0cf2-466b-bd5e-0b0b80513dda';

-- fix #97, excel row 2807
UPDATE shop_product SET category_id = '89c5f154-fa3b-4128-8825-2b770d8ffb48', updated_at = NOW() WHERE id = '2a1456ab-a7dd-4857-95e2-24572ce9ec5a' AND category_id = 'c307831e-0cf2-466b-bd5e-0b0b80513dda';

-- fix #98, excel row 2808
UPDATE shop_product SET category_id = '89c5f154-fa3b-4128-8825-2b770d8ffb48', updated_at = NOW() WHERE id = 'e4e7d7b8-4df0-425f-9cae-5046af9bc38d' AND category_id = 'c307831e-0cf2-466b-bd5e-0b0b80513dda';

-- fix #99, excel row 2809
UPDATE shop_product SET category_id = '89c5f154-fa3b-4128-8825-2b770d8ffb48', updated_at = NOW() WHERE id = '9c15a96b-de3a-4e8c-a77b-2823a337037d' AND category_id = 'c307831e-0cf2-466b-bd5e-0b0b80513dda';

-- fix #100, excel row 2810
UPDATE shop_product SET category_id = '89c5f154-fa3b-4128-8825-2b770d8ffb48', updated_at = NOW() WHERE id = 'e5f53831-c850-4c9e-b8fd-90e1453f6997' AND category_id = 'c307831e-0cf2-466b-bd5e-0b0b80513dda';

-- fix #101, excel row 2811
UPDATE shop_product SET category_id = '89c5f154-fa3b-4128-8825-2b770d8ffb48', updated_at = NOW() WHERE id = '7af23512-2648-4d70-8293-53499e363856' AND category_id = 'c307831e-0cf2-466b-bd5e-0b0b80513dda';

-- fix #102, excel row 2812
UPDATE shop_product SET category_id = '89c5f154-fa3b-4128-8825-2b770d8ffb48', updated_at = NOW() WHERE id = 'e5e7851a-ad0b-46a5-b8d0-2c36d90db856' AND category_id = 'c307831e-0cf2-466b-bd5e-0b0b80513dda';

-- fix #103, excel row 2813
UPDATE shop_product SET category_id = '89c5f154-fa3b-4128-8825-2b770d8ffb48', updated_at = NOW() WHERE id = '7a3f4600-a9e7-4b61-a720-1b050422a242' AND category_id = 'c307831e-0cf2-466b-bd5e-0b0b80513dda';

-- fix #104, excel row 3018
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = '0d9777ff-8355-487d-8fad-c9246487864c' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #105, excel row 3019
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = 'aea3a035-e565-46e4-9043-04b0c548b19e' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #106, excel row 3020
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = '4f29a00e-a9a0-41e6-b9a0-9ff0f6448538' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #107, excel row 3021
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = '99e97ced-8c95-4a9d-bce9-516ddccc54c9' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #108, excel row 3022
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = '2dda57a7-2ce8-49a4-8640-48930f7628d7' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #109, excel row 3023
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = '5bf42770-8bec-48da-a39e-e84ea4563c6c' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #110, excel row 3024
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = '103bdccf-ac82-4952-91ad-10bce22896aa' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #111, excel row 3025
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = 'c4a4b730-5ad2-45c3-89d6-28e216a0f360' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #112, excel row 3026
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = '51cca2d9-eaa6-4c04-a46b-3a86b481a4f5' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #113, excel row 3027
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = '4950fd37-488f-4250-b0ab-ceb9be5f41df' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #114, excel row 3028
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = 'd7ccb465-a924-44c3-a73d-4277165c0343' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #115, excel row 3029
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = 'e94081d7-f532-4f7c-a9c9-913aeb9a259e' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #116, excel row 3030
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = 'ccb2f9d4-fb25-43a5-9e41-8b9c77709854' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #117, excel row 3031
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = '8bbe26c5-197c-4688-88a3-790c76edb250' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #118, excel row 3032
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = '8d5ecd10-200b-4d17-80cc-2f06f66bc8de' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #119, excel row 3033
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = '80960a56-d5de-4509-a0e6-6a9604524942' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #120, excel row 3034
UPDATE shop_product SET category_id = '4258e67f-47d2-4da8-b790-6849a8a522b2', updated_at = NOW() WHERE id = '5db3a7d9-99e2-4fc2-87eb-69f9b7923d2d' AND category_id = '5a3643c0-1a87-4d39-b091-1973bb273fcb';

-- fix #121, excel row 3156
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '09c3f40b-550d-43c1-80f4-7f5d4f7019b4' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #122, excel row 3157
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = 'cb341cc7-34d9-404c-9a70-160f836ebba6' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #123, excel row 3163
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '6967e3be-1eda-40dd-ae56-b6b9f605d598' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #124, excel row 3164
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '6c450389-b24c-482c-8faf-d2dc47c59f77' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #125, excel row 3165
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = 'b69b971d-2c08-426e-8459-ccf7a27d1371' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #126, excel row 3166
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '40f9991b-a162-43bb-a50b-b565a5705594' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #127, excel row 3167
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '1fb2c0e9-0552-48fc-a28c-1f4165346edb' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #128, excel row 3168
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = 'e315388f-64b5-4140-b3b9-70015438c2ad' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #129, excel row 3169
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = 'c703d8cc-713b-4e79-89cf-164a978296b1' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #130, excel row 3170
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '1ab3b4f8-a36d-4e51-9bad-20e12f5baa12' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #131, excel row 3171
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '0ed0721d-9df6-4432-be30-b695bdbb8f3d' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #132, excel row 3172
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '7b7e2413-ed93-4eb2-b917-5c3345d6d445' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #133, excel row 3173
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '7926ffa8-a665-44a5-8947-64b5d11b7629' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #134, excel row 3175
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '39c01d8d-4e0f-4e10-82e6-95ccc49a17de' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #135, excel row 3176
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '9219e90a-d97a-438c-b485-f49e807f1bce' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #136, excel row 3177
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '872532c4-3cf0-4a77-8cd7-0161c21bd0ff' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #137, excel row 3178
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '6e13132e-5b71-4573-acd9-94e7ed6bfb5e' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #138, excel row 3179
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '62d0fbbc-79b1-46f0-ab3d-765e905b2f9b' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #139, excel row 3180
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '297ee30e-f4e1-42a9-b366-9f07eccbb4cb' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #140, excel row 3181
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = 'cfe5a69e-f2ae-49cc-a31b-12e57adc3e34' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #141, excel row 3182
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '1531c319-e92d-49db-b53e-14b746c689a6' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #142, excel row 3183
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '5a08c3c3-e59b-4648-9cd5-c0637019c958' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #143, excel row 3184
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '3e3921cc-8030-43b7-a230-5e197df7f3fa' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #144, excel row 3185
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = 'aabe4898-142b-4448-8a8c-3d409cabc94d' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #145, excel row 3186
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '91856594-fb96-4473-b97a-907158834e2b' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #146, excel row 3187
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '38792b39-6258-4037-80b0-b4806852b3f2' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #147, excel row 3188
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '58b17129-1e67-4740-974f-e5107a6dc2b3' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #148, excel row 3189
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '52dead61-fc9e-4101-b4aa-35652473a94f' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- fix #149, excel row 3190
UPDATE shop_product SET category_id = '795211c2-e06e-4d1a-b3c5-87c807924c79', updated_at = NOW() WHERE id = '3a8e9c78-efcf-490b-8703-3e3dbf612985' AND category_id = '0dd3fa37-acaf-4358-8632-bba32d40896a';

-- If the affected rows count looks wrong, use ROLLBACK instead of COMMIT.
COMMIT;